import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText, Image as ImageIcon, Video, FileAudio, File } from 'lucide-react';
import { toast } from 'sonner';

interface MediaUploaderProps {
  format: 'image' | 'text' | 'video' | 'pdf' | 'audio';
  onUploadComplete: (url: string) => void;
  currentUrl?: string;
}

export function MediaUploader({ format, onUploadComplete, currentUrl }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  const acceptedTypes = {
    image: 'image/*',
    pdf: 'application/pdf',
    audio: 'audio/*',
    video: 'video/*',
    text: '',
  };

  const getIcon = () => {
    switch (format) {
      case 'image': return <ImageIcon className="h-8 w-8" />;
      case 'pdf': return <FileText className="h-8 w-8" />;
      case 'audio': return <FileAudio className="h-8 w-8" />;
      case 'video': return <Video className="h-8 w-8" />;
      default: return <File className="h-8 w-8" />;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${format}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('lesson-media')
        .upload(filePath, file);
      
      setProgress(100);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('lesson-media')
        .getPublicUrl(data.path);

      setPreview(publicUrl);
      onUploadComplete(publicUrl);
      toast.success('Upload realizado com sucesso!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erro ao fazer upload do arquivo');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete('');
  };

  if (format === 'text') {
    return null;
  }

  return (
    <div className="space-y-4">
      <Label>Upload de {format === 'image' ? 'Imagem' : format === 'pdf' ? 'PDF' : format === 'audio' ? 'Áudio' : 'Vídeo'}</Label>
      
      {!preview ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
          <div className="flex flex-col items-center gap-4">
            {getIcon()}
            <div>
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 text-primary">
                  <Upload className="h-4 w-4" />
                  <span>Clique para fazer upload</span>
                </div>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept={acceptedTypes[format]}
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>
          </div>
          {uploading && (
            <div className="mt-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}%</p>
            </div>
          )}
        </div>
      ) : (
        <div className="relative border rounded-lg p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {format === 'image' && (
            <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded" />
          )}
          {format === 'pdf' && (
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              <span className="text-sm">PDF carregado</span>
            </div>
          )}
          {format === 'audio' && (
            <audio src={preview} controls className="w-full" />
          )}
          {format === 'video' && (
            <video src={preview} controls className="w-full max-h-64" />
          )}
        </div>
      )}
    </div>
  );
}
