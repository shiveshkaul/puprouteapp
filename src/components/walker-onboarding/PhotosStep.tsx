import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FaCamera, FaUpload, FaTrash } from 'react-icons/fa';

interface PhotosStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const PhotosStep = ({ data, updateData, onNext, onPrev }: PhotosStepProps) => {
  const [dragOver, setDragOver] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    // Mock file upload - in real app, upload to cloud storage
    const newPhotos = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    
    updateData({ 
      galleryPhotos: [...(data.galleryPhotos || []), ...newPhotos] 
    });
  };

  const removePhoto = (photoId: number) => {
    updateData({
      galleryPhotos: (data.galleryPhotos || []).filter((photo: any) => photo.id !== photoId)
    });
  };

  const setProfilePhoto = (photoUrl: string) => {
    updateData({ profilePhoto: photoUrl });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Add Your Photos</h2>
        <p className="text-gray-600">
          Show pet owners who you are! Add photos of yourself with pets to build trust and credibility.
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Photo Section */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Profile Photo</h3>
          <p className="text-sm text-gray-600 mb-6">
            This is the first photo pet owners will see. We recommend using a well-lit, clear photo of your face (without sunglasses).
          </p>
          
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              {data.profilePhoto ? (
                <div className="relative">
                  <img 
                    src={data.profilePhoto} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-green-200"
                  />
                  <button
                    type="button"
                    onClick={() => updateData({ profilePhoto: '' })}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FaTrash className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-400">
                  <FaCamera className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProfilePhoto(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />
                <Button type="button" variant="outline" className="cursor-pointer">
                  <FaUpload className="mr-2 h-4 w-4" />
                  Upload Profile Photo
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG up to 10MB. Make sure your face is clearly visible.
              </p>
            </div>
          </div>
        </Card>

        {/* Gallery Photos Section */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Gallery Photos</h3>
          <p className="text-sm text-gray-600 mb-6">
            Add photos of yourself with pets (including your own) to show the care and attention you give to them. 
            If possible, try to include photos of yourself walking or playing with pets. We suggest 5-10 of your best photos.
          </p>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFileUpload(e.dataTransfer.files);
            }}
          >
            <FaUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Upload images from computer
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or drag images into this box
            </p>
            <label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              <Button type="button" variant="outline" className="cursor-pointer">
                Choose Files
              </Button>
            </label>
          </div>

          {/* Photo Grid */}
          {data.galleryPhotos && data.galleryPhotos.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-800 mb-4">
                Your Photos ({data.galleryPhotos.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.galleryPhotos.map((photo: any) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <FaTrash className="h-3 w-3" />
                    </button>
                    {!data.profilePhoto && (
                      <button
                        type="button"
                        onClick={() => setProfilePhoto(photo.url)}
                        className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-600"
                      >
                        Set as Profile
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Photo Tips */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3">📸 Photo Tips for Success</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <ul className="space-y-2">
              <li>• Use natural lighting when possible</li>
              <li>• Show yourself actively engaging with pets</li>
              <li>• Include photos with different dog sizes/breeds</li>
              <li>• Smile and look approachable</li>
            </ul>
            <ul className="space-y-2">
              <li>• Avoid blurry or dark photos</li>
              <li>• Don't include personal information in photos</li>
              <li>• Show your outdoor walking setup</li>
              <li>• Include action shots if possible</li>
            </ul>
          </div>
        </Card>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onPrev}>
              ← Back
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
            >
              Continue →
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
