Got it — you want a fully working real-time transcription setup using the OpenAI Realtime API, with:

live microphone input,

transcription streaming,

optional webhook + server-side “sideband” control channel.

Let’s make this clear and modular so you can run it right away.

🧩 Overview Diagram (Realtime Flow)
[ Microphone ] 
     │
     ▼
[ Browser Client ] -- WebRTC --> [ OpenAI Realtime API ]
     │                                   ▲
     │                                   │
     └────── Sideband WebSocket ─────────┘
                     │
                     ▼
           [ Your Node.js Server ]
           - Receives Webhooks
           - Controls session
           - Updates instructions
           - Stores transcriptions

⚙️ 1. Server: Express + WebSocket Sideband Controller

Create server.js
This runs your webhook + sideband logic.

import express from "express";
import bodyParser from "body-parser";
import WebSocket from "ws";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// --- Step 1: Handle webhook from OpenAI (for SIP or Realtime control)
app.post("/webhook", async (req, res) => {
  console.log("Webhook received:", req.body);

  const { call_id } = req.body.data || {};
  if (!call_id) return res.status(400).send("Missing call_id");

  // Step 2: Connect to Realtime API via sideband WebSocket
  const wsUrl = `wss://api.openai.com/v1/realtime?call_id=${call_id}`;
  const ws = new WebSocket(wsUrl, {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
  });

  ws.on("open", () => {
    console.log("Connected to OpenAI Realtime via sideband.");

    // Optional: Update model or instructions
    ws.send(
      JSON.stringify({
        type: "session.update",
        session: {
          type: "realtime",
          instructions: "Transcribe everything clearly.",
        },
      })
    );
  });

  ws.on("message", (msg) => {
    const data = JSON.parse(msg.toString());
    console.log("Realtime event:", data);
  });

  res.sendStatus(200);
});

// --- Start the server
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});


Run:

npm install express ws node-fetch body-parser
node server.js

🖥️ 2. Client: Browser Realtime Transcription (WebRTC)

Create index.html and run with a local server (e.g., vite, python -m http.server).

<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Realtime Transcription</title>
</head>
<body>
  <h1>🎙️ Realtime Transcription Demo</h1>
  <button id="startBtn">Start Transcription</button>
  <pre id="output"></pre>

  <script>
    const startBtn = document.getElementById("startBtn");
    const output = document.getElementById("output");

    async function startTranscription() {
      const pc = new RTCPeerConnection();
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      pc.ontrack = (e) => (audioEl.srcObject = e.streams[0]);

      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      pc.addTrack(localStream.getTracks()[0]);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 🔑 Fetch ephemeral key from your backend (never expose API key client-side)
      const tokenRes = await fetch("/ephemeral-key");
      const { EPHEMERAL_KEY } = await tokenRes.json();

      const baseUrl = "https://api.openai.com/v1/realtime/calls";
      const sdpResponse = await fetch(baseUrl, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      const answer = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);

      // Listen for incoming transcription events (data channel)
      pc.ondatachannel = (event) => {
        const channel = event.channel;
        channel.onmessage = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.type === "transcript") {
            output.textContent += msg.text + "\n";
          }
        };
      };
    }

    startBtn.onclick = startTranscription;
  </script>
</body>
</html>

🔐 3. Ephemeral Key Endpoint (Server)

Add this route to server.js:

app.get("/ephemeral-key", async (req, res) => {
  const resp = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-realtime-preview", // or gpt-realtime
      modalities: ["text"], // transcription only
    }),
  });

  const data = await resp.json();
  res.json({ EPHEMERAL_KEY: data.client_secret.value });
});

🧠 4. Optional: WebSocket Transcription (Node or Python)

If you prefer not to use WebRTC, here’s a Node WebSocket version:

import WebSocket from "ws";
import fs from "fs";
import base64 from "base64-js";

const ws = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-realtime", {
  headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
});

ws.on("open", () => {
  console.log("Connected.");

  // Stream audio from file (base64)
  const audioBytes = fs.readFileSync("./sample.wav");
  const chunk = audioBytes.toString("base64");

  ws.send(JSON.stringify({ type: "input_audio_buffer.append", audio: chunk }));
  ws.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
  ws.send(JSON.stringify({ type: "response.create" }));
});

ws.on("message", (msg) => {
  const data = JSON.parse(msg.toString());
  if (data.type === "response.output_text.delta") {
    process.stdout.write(data.delta);
  }
});

🧩 5. Real-time Webhook Verification (optional)

You can verify webhooks from OpenAI:

import crypto from "crypto";

function verifyWebhook(req) {
  const sig = req.headers["webhook-signature"];
  const [version, hash] = sig.split(",");
  const payload = req.rawBody;
  const secret = process.env.OPENAI_WEBHOOK_SECRET;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${version}.${req.headers["webhook-timestamp"]}.${payload}`);
  const computed = hmac.digest("base64");

  return computed === hash;
}

🧾 Summary

✅ Real-time microphone transcription using WebRTC
✅ Secure ephemeral key exchange
✅ Optional sideband control via WebSocket
✅ Extendable to SIP + webhook systems

Would you like me to extend this with live subtitle overlay (e.g., showing real-time captions on screen in sync with speech)?