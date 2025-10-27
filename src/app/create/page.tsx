"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  Target, 
  Users, 
  DollarSign, 
  TrendingUp, 
  FileText,
  Plus,
  X,
  ChevronRight,
  CheckCircle,
  Brain,
  Sparkles,
  AlertCircle
} from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { PitchCreationPayment } from "@/components/payments/BasePayComponents";
import { useEvmAddress } from "@coinbase/cdp-hooks";

interface PitchFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  oneLiner: string;
  targetAmount: number;
  equityOffered: number;
  valuation: number;
  traction: string;
  teamSize: number;
  stage: string;
  deckUrl: string;
  // Pre-defined pitch sections
  sections: {
    problemStatement: string;
    solution: string;
    marketSize: string;
    businessModel: string;
    competitiveAdvantage: string;
    financialProjections: string;
    fundingUse: string;
    teamBackground: string;
    milestones: string;
    riskFactors: string;
  };
}

const categories = [
  "AI/ML", "FinTech", "HealthTech", "EdTech", "SaaS", 
  "E-commerce", "Climate Tech", "Web3", "Mobile", "Other"
];

const stages = [
  "Pre-seed", "Seed", "Series A", "Series B", "Growth"
];

export default function CreatePitch() {
  const { evmAddress } = useEvmAddress(); // Get creator's wallet address
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [analysisResult, setAnalysisResult] = useState<{
    score: number;
    analysis: string;
    improvedPitch?: string;
    suggestions?: string[];
  } | null>(null);
  
  const [formData, setFormData] = useState<PitchFormData>({
    title: "",
    description: "",
    category: "",
    tags: [],
    oneLiner: "",
    targetAmount: 0,
    equityOffered: 0,
    valuation: 0,
    traction: "",
    teamSize: 1,
    stage: "Pre-seed",
    deckUrl: "",
    sections: {
      problemStatement: "",
      solution: "",
      marketSize: "",
      businessModel: "",
      competitiveAdvantage: "",
      financialProjections: "",
      fundingUse: "",
      teamBackground: "",
      milestones: "",
      riskFactors: ""
    }
  });

  const updateFormData = (field: keyof PitchFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      updateFormData('tags', [...formData.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFormData('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const analyzePitch = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/analyze-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result);
        setCurrentStep(6); // Move to analysis step
      } else {
        throw new Error('Failed to analyze pitch');
      }
    } catch (error) {
      console.error('Error analyzing pitch:', error);
      alert('Failed to analyze pitch. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitPitch = async (finalPitchData?: any) => {
    if (!isPaid) {
      alert('Please complete payment before creating your pitch.');
      return;
    }

    if (!evmAddress) {
      alert('Please connect your wallet to create a pitch.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const pitchToSubmit = finalPitchData || formData;
      
      const response = await fetch('/api/pitches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...pitchToSubmit,
          founderId: evmAddress, // Use creator's wallet address as founderId
          creatorWalletAddress: evmAddress, // Store creator's wallet address
          analysisScore: analysisResult?.score,
          analysisData: analysisResult,
          paymentId: paymentId // Include payment ID for verification
        })
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        throw new Error('Failed to create pitch');
      }
    } catch (error) {
      console.error('Error creating pitch:', error);
      alert('Failed to create pitch. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: "Basic Info", icon: Lightbulb },
    { id: 2, title: "Pitch Sections", icon: FileText },
    { id: 3, title: "Business Details", icon: Target },
    { id: 4, title: "Financials", icon: DollarSign },
    { id: 5, title: "Review", icon: CheckCircle },
    { id: 6, title: "AI Analysis", icon: Brain }
  ];

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-green-400 rounded-full mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Pitch Created!</h1>
          <p className="text-gray-300 mb-8">
            Your pitch has been successfully created and is now live. Investors can start booking sessions with you.
          </p>
          <Button 
            className="bg-yellow-400 text-black hover:bg-yellow-300"
            onClick={() => window.location.href = '/dashboard'}
          >
            Go to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create Your Pitch</h1>
          <p className="text-gray-400">Tell investors about your brilliant idea</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <motion.div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                      isActive 
                        ? 'border-yellow-400 bg-yellow-400/20' 
                        : isCompleted 
                          ? 'border-green-400 bg-green-400/20' 
                          : 'border-gray-600 bg-gray-800'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon className={`w-6 h-6 ${
                      isActive ? 'text-yellow-400' : isCompleted ? 'text-green-400' : 'text-gray-400'
                    }`} />
                  </motion.div>
                  <span className={`text-xs mt-2 font-medium ${
                    isActive ? 'text-yellow-400' : isCompleted ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`w-full h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-400' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && (
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="w-6 h-6 mr-2 text-yellow-400" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Pitch Title</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                    placeholder="e.g., AI-Powered Customer Support Platform"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">One-Liner</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                    placeholder="Describe your startup in one sentence"
                    value={formData.oneLiner}
                    onChange={(e) => updateFormData('oneLiner', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none h-32"
                    placeholder="Detailed description of your startup, problem, and solution..."
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                    value={formData.category}
                    onChange={(e) => updateFormData('category', e.target.value)}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                      placeholder="Add tags (e.g., SaaS, B2B, AI)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button onClick={addTag} className="bg-yellow-400 text-black hover:bg-yellow-300">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                        {tag}
                        <X 
                          className="w-3 h-3 ml-2 cursor-pointer" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-yellow-400" />
                  Pitch Sections
                </CardTitle>
                <p className="text-gray-400 text-sm mt-2">
                  Complete these structured sections to create a comprehensive pitch
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Problem Statement</label>
                    <textarea
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none h-24"
                      placeholder="What problem are you solving? Why is it important?"
                      value={formData.sections.problemStatement}
                      onChange={(e) => updateFormData('sections', { ...formData.sections, problemStatement: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Solution</label>
                    <textarea
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none h-24"
                      placeholder="How does your product/service solve this problem?"
                      value={formData.sections.solution}
                      onChange={(e) => updateFormData('sections', { ...formData.sections, solution: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Market Size</label>
                    <textarea
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none h-24"
                      placeholder="What's the total addressable market (TAM)? Market opportunity?"
                      value={formData.sections.marketSize}
                      onChange={(e) => updateFormData('sections', { ...formData.sections, marketSize: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Business Model</label>
                    <textarea
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none h-24"
                      placeholder="How do you make money? Revenue streams?"
                      value={formData.sections.businessModel}
                      onChange={(e) => updateFormData('sections', { ...formData.sections, businessModel: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Competitive Advantage</label>
                    <textarea
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none h-24"
                      placeholder="What makes you unique? Your moat?"
                      value={formData.sections.competitiveAdvantage}
                      onChange={(e) => updateFormData('sections', { ...formData.sections, competitiveAdvantage: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Financial Projections</label>
                    <textarea
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none h-24"
                      placeholder="Revenue projections, key metrics, growth expectations"
                      value={formData.sections.financialProjections}
                      onChange={(e) => updateFormData('sections', { ...formData.sections, financialProjections: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Use of Funds</label>
                    <textarea
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none h-24"
                      placeholder="How will you use the investment? Breakdown of fund allocation"
                      value={formData.sections.fundingUse}
                      onChange={(e) => updateFormData('sections', { ...formData.sections, fundingUse: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Team Background</label>
                    <textarea
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none h-24"
                      placeholder="Key team members, their experience, and relevant expertise"
                      value={formData.sections.teamBackground}
                      onChange={(e) => updateFormData('sections', { ...formData.sections, teamBackground: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Key Milestones</label>
                    <textarea
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none h-24"
                      placeholder="Past achievements and future milestones with timeline"
                      value={formData.sections.milestones}
                      onChange={(e) => updateFormData('sections', { ...formData.sections, milestones: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Risk Factors</label>
                    <textarea
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none h-24"
                      placeholder="Key risks and how you plan to mitigate them"
                      value={formData.sections.riskFactors}
                      onChange={(e) => updateFormData('sections', { ...formData.sections, riskFactors: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-6 h-6 mr-2 text-yellow-400" />
                  Business Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Stage</label>
                  <select
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                    value={formData.stage}
                    onChange={(e) => updateFormData('stage', e.target.value)}
                  >
                    {stages.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Team Size</label>
                  <input
                    type="number"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                    placeholder="Number of team members"
                    value={formData.teamSize}
                    onChange={(e) => updateFormData('teamSize', parseInt(e.target.value) || 1)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Traction</label>
                  <textarea
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none h-24"
                    placeholder="Describe your traction (users, revenue, milestones, etc.)"
                    value={formData.traction}
                    onChange={(e) => updateFormData('traction', e.target.value)}
                  />
                </div>

                <div>
                  <FileUpload
                    label="Pitch Deck"
                    description="Upload your pitch deck (PDF, PPT, or DOC)"
                    acceptedTypes={['.pdf', '.ppt', '.pptx', '.doc', '.docx']}
                    maxSizeMB={15}
                    currentFile={formData.deckUrl}
                    onUploadComplete={(ipfsUrl, fileName) => {
                      updateFormData('deckUrl', ipfsUrl);
                    }}
                    onUploadError={(error) => {
                      console.error('Upload error:', error);
                      alert('Failed to upload file: ' + error);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-6 h-6 mr-2 text-green-400" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Target Amount (USDC)</label>
                  <input
                    type="number"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                    placeholder="Amount you're looking to raise"
                    value={formData.targetAmount || ''}
                    onChange={(e) => updateFormData('targetAmount', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Equity Offered (%)</label>
                  <input
                    type="number"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                    placeholder="Percentage of equity offered"
                    value={formData.equityOffered || ''}
                    onChange={(e) => updateFormData('equityOffered', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Valuation (USDC)</label>
                  <input
                    type="number"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                    placeholder="Current valuation"
                    value={formData.valuation || ''}
                    onChange={(e) => updateFormData('valuation', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
                  <p className="text-sm text-yellow-300">
                    💡 <strong>Tip:</strong> Be realistic with your valuation. Investors appreciate founders who understand their market position and have done their research.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 6 && (
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-green-400" />
                  Review Your Pitch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-yellow-400">Basic Info</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-400">Title:</span> {formData.title}</div>
                      <div><span className="text-gray-400">Category:</span> {formData.category}</div>
                      <div><span className="text-gray-400">Stage:</span> {formData.stage}</div>
                      <div><span className="text-gray-400">Team Size:</span> {formData.teamSize}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-green-400">Financials</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-400">Target:</span> ${formData.targetAmount.toLocaleString()}</div>
                      <div><span className="text-gray-400">Equity:</span> {formData.equityOffered}%</div>
                      <div><span className="text-gray-400">Valuation:</span> ${formData.valuation.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-yellow-400">One-Liner</h3>
                  <p className="text-sm text-gray-300">{formData.oneLiner}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">Description</h3>
                  <p className="text-sm text-gray-300">{formData.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-yellow-400">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-green-400/10 border border-green-400/30 rounded-lg">
                  <p className="text-sm text-green-300">
                    ✅ Your pitch is ready for AI analysis! Our AI will review, score, and potentially improve your pitch to meet VC standards.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 5 && (
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-6 h-6 mr-2 text-purple-400" />
                  AI Pitch Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isPaid ? (
                  <div className="text-center py-8">
                    <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Ready for AI Analysis</p>
                    <p className="text-sm text-gray-400 mb-6">
                      Our AI will analyze your pitch and provide detailed feedback to help you create a VC-ready presentation.
                    </p>
                    
                    {/* Payment Section */}
                    <div className="border border-gray-700 p-6 rounded-lg bg-gray-800/50">
                      <h3 className="text-lg font-semibold mb-4 text-yellow-400">Complete Payment to Analyze Pitch</h3>
                      <PitchCreationPayment
                        onPaymentSuccess={(paymentId) => {
                          setIsPaid(true);
                          setPaymentId(paymentId);
                          console.log('Payment successful:', paymentId);
                        }}
                        onPaymentError={(error) => {
                          console.error('Payment failed:', error);
                        }}
                      />
                    </div>
                  </div>
                ) : isAnalyzing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-lg font-medium mb-2">Analyzing Your Pitch...</p>
                    <p className="text-sm text-gray-400">Our AI is reviewing your pitch for completeness, clarity, and VC readiness</p>
                  </div>
                ) : analysisResult ? (
                  <div className="space-y-6">
                    {/* Score Display */}
                    <div className="text-center p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-400/30">
                      <div className="text-4xl font-bold mb-2">
                        <span className={analysisResult.score >= 80 ? 'text-green-400' : analysisResult.score >= 70 ? 'text-yellow-400' : 'text-red-400'}>
                          {analysisResult.score}
                        </span>
                        <span className="text-gray-400">/100</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        {analysisResult.score >= 80 ? 'Excellent! VC-ready pitch' : 
                         analysisResult.score >= 70 ? 'Good pitch with room for improvement' : 
                         'Needs significant improvement'}
                      </p>
                    </div>

                    {/* Analysis */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-white flex items-center">
                        <Sparkles className="w-5 h-5 mr-2" />
                        Detailed Analysis
                      </h3>
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">
                          {analysisResult.analysis}
                        </pre>
                      </div>
                    </div>

                    {/* Improved Pitch or Suggestions */}
                    {analysisResult.improvedPitch ? (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-green-400 flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          AI-Improved Pitch
                        </h3>
                        <div className="bg-green-900/20 border border-green-400/30 p-4 rounded-lg">
                          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">
                            {analysisResult.improvedPitch}
                          </pre>
                        </div>
                        <div className="flex gap-3 mt-4">
                          <Button
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => submitPitch({ 
                              ...formData, 
                              description: analysisResult.improvedPitch,
                              aiImproved: true 
                            })}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Creating...' : 'Use AI-Improved Pitch'}
                          </Button>
                          <Button
                            variant="outline"
                            className="border-gray-600 text-white hover:bg-gray-800"
                            onClick={() => submitPitch()}
                            disabled={isSubmitting}
                          >
                            Keep Original Pitch
                          </Button>
                        </div>
                      </div>
                    ) : analysisResult.suggestions ? (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-yellow-400 flex items-center">
                          <AlertCircle className="w-5 h-5 mr-2" />
                          Improvement Suggestions
                        </h3>
                        <div className="bg-yellow-900/20 border border-yellow-400/30 p-4 rounded-lg">
                          <ul className="space-y-2">
                            {analysisResult.suggestions.map((suggestion, index) => (
                              <li key={index} className="text-sm text-gray-300 flex items-start">
                                <span className="text-yellow-400 mr-2">•</span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button
                          className="bg-yellow-400 text-black hover:bg-yellow-300 mt-4"
                          onClick={() => submitPitch()}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Creating...' : 'Create Pitch Anyway'}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Ready for AI Analysis</p>
                    <p className="text-sm text-gray-400 mb-6">
                      Our AI will analyze your pitch and provide detailed feedback to help you create a VC-ready presentation.
                    </p>
                    <Button
                      className="bg-gray-700 hover:bg-gray-600 text-white"
                      onClick={analyzePitch}
                      disabled={isAnalyzing}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze My Pitch
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-800"
            onClick={() => {
              if (currentStep === 6 && !analysisResult) {
                setCurrentStep(5);
              } else {
                setCurrentStep(Math.max(1, currentStep - 1));
              }
            }}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          {currentStep < 5 ? (
            <Button
              className="bg-yellow-400 text-black hover:bg-yellow-300"
              onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : currentStep === 5 ? (
            <Button
              className="bg-purple-500 hover:bg-purple-600"
              onClick={analyzePitch}
              disabled={isAnalyzing || !isPaid}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
              <Brain className="w-4 h-4 ml-2" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}