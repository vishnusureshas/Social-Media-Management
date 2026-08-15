import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useUploadAvatarMutation, useUploadCoverMutation } from '../../api/userApi';
import { getApiErrorMessage } from '../../utils/errorUtils';
import cn from '../../utils/cn';

const useUploader = (mutation, fieldLabel) => {
  const [upload, { isLoading }] = mutation();
  const [preview, setPreview] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const formData = new FormData();
    formData.append('image', file);

    try {
      await upload(formData).unwrap();
      toast.success(`${fieldLabel} updated!`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, `${fieldLabel} upload failed`));
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  return { upload, isLoading, preview, handleFile };
};

const UploadBox = ({
  label,
  hint,
  value,
  preview,
  isLoading,
  onFile,
  aspect = 'aspect-video',
}) => {
  const inputRef = useRef(null);
  const display = preview || value;

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-slate-600">{label}</span>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
        className={cn(
          'group relative block w-full overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 transition-all duration-300',
          'hover:border-brand-400 hover:bg-brand-50/50',
          aspect
        )}
      >
        {display ? (
          <img src={display} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V4m0 0l-4 4m4-4l4 4M5 20h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-semibold">{isLoading ? 'Uploading...' : hint}</span>
          </span>
        )}
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <svg className="h-6 w-6 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <p className="mt-1.5 text-xs text-slate-400">{hint} (JPG/PNG, max 5MB)</p>
    </div>
  );
};

const AvatarUpload = ({ avatar, onDone }) => {
  const { isLoading, preview, handleFile } = useUploader(useUploadAvatarMutation, 'Avatar');
  return (
    <UploadBox
      label="Avatar"
      hint="Click to upload"
      value={avatar}
      preview={preview}
      isLoading={isLoading}
      onFile={async (f) => {
        await handleFile(f);
        onDone?.();
      }}
      aspect="aspect-square"
    />
  );
};

const CoverUpload = ({ coverPhoto, onDone }) => {
  const { isLoading, preview, handleFile } = useUploader(useUploadCoverMutation, 'Cover photo');
  return (
    <UploadBox
      label="Cover photo"
      hint="Click to upload"
      value={coverPhoto}
      preview={preview}
      isLoading={isLoading}
      onFile={async (f) => {
        await handleFile(f);
        onDone?.();
      }}
      aspect="aspect-[3/1]"
    />
  );
};

export { AvatarUpload, CoverUpload };
