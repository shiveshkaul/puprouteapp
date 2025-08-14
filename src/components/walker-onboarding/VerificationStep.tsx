import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FaIdCard, FaPassport, FaCarSide, FaHome, FaUpload, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

interface VerificationStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const documentTypes = {
  'driving-licence': {
    icon: FaCarSide,
    title: 'Driving licence',
    requirements: 'Front and back',
    description: 'Valid driver\'s license from your country'
  },
  'national-id': {
    icon: FaIdCard,
    title: 'National identity card', 
    requirements: 'Front and back',
    description: 'Government-issued national ID card'
  },
  'passport': {
    icon: FaPassport,
    title: 'Passport',
    requirements: 'Photo page',
    description: 'Valid passport photo page'
  },
  'residence-permit': {
    icon: FaHome,
    title: 'Residence permit',
    requirements: 'Front and back', 
    description: 'EU residence permit or visa'
  }
};

export const VerificationStep = ({ data, updateData, onNext, onPrev }: VerificationStepProps) => {
  const [uploadStep, setUploadStep] = useState<'select' | 'upload' | 'verify'>('select');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationStatus === 'approved') {
      onNext();
    }
  };

  const handleDocumentSelect = (docType: string) => {
    updateData({
      verificationDocuments: {
        ...data.verificationDocuments,
        type: docType
      }
    });
    setUploadStep('upload');
  };

  const handleFileUpload = (side: 'front' | 'back', file: File) => {
    const fileUrl = URL.createObjectURL(file);
    updateData({
      verificationDocuments: {
        ...data.verificationDocuments,
        [side]: fileUrl
      }
    });
    
    // Mock verification process
    setTimeout(() => {
      setUploadStep('verify');
      setTimeout(() => {
        setVerificationStatus('approved');
      }, 2000);
    }, 1000);
  };

  const selectedDocType = data.verificationDocuments?.type;
  const selectedDoc = selectedDocType ? documentTypes[selectedDocType as keyof typeof documentTypes] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Identity Verification</h2>
        <p className="text-gray-600">
          For safety and trust, we need to verify your identity. This process is secure and your information is protected.
        </p>
      </div>

      <Card className="p-8">
        {uploadStep === 'select' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Choose Your Document</h3>
              <p className="text-sm text-gray-600">
                Select issuing country to see which documents we accept
              </p>
            </div>

            {/* Country Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issuing country
              </label>
              <Select defaultValue="Germany">
                <SelectTrigger>
                  <SelectValue placeholder="Select issuing country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Germany">🇩🇪 Germany</SelectItem>
                  <SelectItem value="Austria">🇦🇹 Austria</SelectItem>
                  <SelectItem value="Switzerland">🇨🇭 Switzerland</SelectItem>
                  <SelectItem value="Netherlands">🇳🇱 Netherlands</SelectItem>
                  <SelectItem value="Belgium">🇧🇪 Belgium</SelectItem>
                  <SelectItem value="France">🇫🇷 France</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Document Types */}
            <div>
              <h4 className="font-medium text-gray-800 mb-4">Accepted documents</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(documentTypes).map(([key, doc]) => {
                  const IconComponent = doc.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleDocumentSelect(key)}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all text-left"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <IconComponent className="h-6 w-6 text-green-600" />
                        <h5 className="font-medium text-gray-800">{doc.title}</h5>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{doc.requirements}</p>
                      <p className="text-xs text-gray-500">{doc.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="text-blue-500 text-lg">🔒</div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Your Privacy is Protected</h4>
                  <p className="text-sm text-blue-700">
                    We use bank-level encryption to protect your documents. They're only used for verification 
                    and are automatically deleted after 30 days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {uploadStep === 'upload' && selectedDoc && (
          <div className="space-y-6">
            <div className="text-center">
              <selectedDoc.icon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Submit {selectedDoc.title}
              </h3>
              <p className="text-sm text-gray-600">
                Take clear photos with your phone - {selectedDoc.requirements.toLowerCase()}
              </p>
            </div>

            <div className="space-y-4">
              {/* Front Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedDoc.title} (front)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 hover:bg-green-50 transition-colors">
                  {data.verificationDocuments?.front ? (
                    <div className="space-y-2">
                      <FaCheck className="h-8 w-8 text-green-500 mx-auto" />
                      <p className="text-sm text-green-600 font-medium">Front uploaded successfully</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FaUpload className="h-8 w-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">Take a photo with your phone</p>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('front', file);
                          }}
                          className="hidden"
                        />
                        <Button type="button" variant="outline" className="cursor-pointer">
                          Choose File
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Back Upload (if required) */}
              {selectedDoc.requirements.includes('back') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedDoc.title} (back)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 hover:bg-green-50 transition-colors">
                    {data.verificationDocuments?.back ? (
                      <div className="space-y-2">
                        <FaCheck className="h-8 w-8 text-green-500 mx-auto" />
                        <p className="text-sm text-green-600 font-medium">Back uploaded successfully</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FaUpload className="h-8 w-8 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-600">Take a photo with your phone</p>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload('back', file);
                            }}
                            className="hidden"
                          />
                          <Button type="button" variant="outline" className="cursor-pointer">
                            Choose File
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FaExclamationTriangle className="text-yellow-500 h-5 w-5 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Important</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Scans or photocopies are not accepted. Make sure all corners of the document 
                    are visible and text is clearly readable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {uploadStep === 'verify' && (
          <div className="text-center space-y-6">
            {verificationStatus === 'pending' && (
              <div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Verifying Your Documents</h3>
                <p className="text-sm text-gray-600">
                  Please wait while we verify your identity. This usually takes just a few seconds.
                </p>
              </div>
            )}

            {verificationStatus === 'approved' && (
              <div>
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <FaCheck className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">Identity Verified! ✅</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your identity has been successfully verified. You're one step closer to becoming a PupRoute walker!
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-green-800 mb-2">Verification Complete</h4>
                  <p className="text-sm text-green-700">
                    Your documents have been verified and securely processed. You can now proceed to the final step.
                  </p>
                </div>
              </div>
            )}

            {verificationStatus === 'rejected' && (
              <div>
                <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <FaExclamationTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-red-800 mb-2">Verification Failed</h3>
                <p className="text-sm text-gray-600 mb-4">
                  We couldn't verify your documents. Please try uploading them again.
                </p>
                <Button
                  type="button"
                  onClick={() => setUploadStep('upload')}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex justify-between pt-8">
            <Button type="button" variant="outline" onClick={onPrev}>
              ← Back
            </Button>
            {verificationStatus === 'approved' && (
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700"
              >
                Continue →
              </Button>
            )}
          </div>
        </form>
      </Card>
    </motion.div>
  );
};
