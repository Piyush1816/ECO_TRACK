import { getSupabaseClient } from '../lib/supabase';

export type StorageBucket = 
  | 'ewaste-photos' 
  | 'weighing-slips' 
  | 'recycling-documents' 
  | 'epr-manifests';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
];

export const storageService = {
  async uploadFile(bucket: StorageBucket, path: string, file: File): Promise<{ url: string; error: Error | null }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { url: '', error: new Error('Supabase is not configured.') };
    }

    // Validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { url: '', error: new Error('File exceeds maximum allowed size of 10MB.') };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { url: '', error: new Error('Invalid file type. Allowed formats: JPEG, PNG, WEBP, PDF.') };
    }

    try {
      const cleanPath = `${Date.now()}_${path.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(cleanPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        return { url: '', error };
      }

      // Generate signed URL valid for 24 hours (for private bucket protection)
      const { data: signedData, error: signError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(data.path, 60 * 60 * 24);

      if (signError || !signedData?.signedUrl) {
        // Fallback to getPublicUrl if bucket is configured public
        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
        return { url: publicData.publicUrl, error: null };
      }

      return { url: signedData.signedUrl, error: null };
    } catch (err) {
      return { url: '', error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  async getSignedUrl(bucket: StorageBucket, path: string, expiresInSeconds: number = 3600): Promise<string | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresInSeconds);

      if (error || !data) return null;
      return data.signedUrl;
    } catch {
      return null;
    }
  }
};
