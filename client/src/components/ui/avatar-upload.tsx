import { useRef, useState } from "react";
import { Camera } from "lucide-react";

interface AvatarUploadProps {
  initialImage?: string;
  onImageChange: (base64Image: string) => void;
}

export function AvatarUpload({ initialImage, onImageChange }: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (loadEvent) => {
        const base64 = loadEvent.target?.result as string;
        setPreviewUrl(base64);
        onImageChange(base64);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="relative">
        <div 
          className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-secondary overflow-hidden"
        >
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <button 
          type="button" 
          className="absolute bottom-0 right-0 bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md"
          onClick={handleButtonClick}
        >
          <Camera className="h-4 w-4" />
        </button>
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      <p className="text-sm text-gray-500 mt-2">Upload Profile Photo</p>
    </div>
  );
}
