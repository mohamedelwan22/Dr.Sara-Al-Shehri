import { requireSupabase } from '@/lib/supabase';
import { CONTACT_ATTACHMENTS_BUCKET } from '@/lib/storageFiles';
import { uuid } from '@/lib/utils';
import type { ContactSubmission, ContactAttachment } from '@/types';
import type { ContactFormValues } from '@/schemas/contact';
import { getContactPayload } from '@/schemas/contact';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export interface SubmitContactInput {
  form: ContactFormValues;
  attachment?: File | null;
}

export const contactService = {
  async submit({ form, attachment }: SubmitContactInput): Promise<{
    submission: ContactSubmission;
    attachment?: ContactAttachment;
  }> {
    const client = requireSupabase();

    const payload = getContactPayload(form);

    const { data: submissionData, error: submissionError } = await client
      .from('contact_submissions')
      .insert({
        user_id: null,
        type: form.type,
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        message: form.message,
        payload,
        status: 'new',
      })
      .select('*')
      .single();
    if (submissionError) throw submissionError;

    let attachmentRow: ContactAttachment | undefined;
    if (attachment) {
      if (!ALLOWED_MIME_TYPES.includes(attachment.type) && !attachment.name.match(/\.(pdf|doc|docx)$/i)) {
        throw new Error('contact.invalidFileType');
      }
      if (attachment.size > MAX_FILE_BYTES) {
        throw new Error('contact.fileTooLarge');
      }

      const ext = attachment.name.split('.').pop()?.toLowerCase() || 'pdf';
      const storagePath = `${submissionData.id}/${uuid()}.${ext}`;
      const { error: uploadError } = await client.storage
        .from(CONTACT_ATTACHMENTS_BUCKET)
        .upload(storagePath, attachment, { contentType: attachment.type || 'application/octet-stream', upsert: false });
      if (uploadError) throw uploadError;

      const { data: attachData, error: attachError } = await client
        .from('contact_attachments')
        .insert({
          submission_id: submissionData.id,
          storage_path: storagePath,
          mime_type: attachment.type || 'application/octet-stream',
          size_bytes: attachment.size,
        })
        .select('*')
        .single();
      if (attachError) throw attachError;
      attachmentRow = attachData as ContactAttachment;
    }

    return { submission: submissionData as ContactSubmission, attachment: attachmentRow };
  },

  /** طلبات تواصل المستخدم الحالي فقط (RLS: user_id = auth.uid()). */
  async listMySubmissions(): Promise<ContactSubmission[]> {
    const client = requireSupabase();
    const {
      data: { session },
    } = await client.auth.getSession();
    if (!session?.user.id) return [];
    const { data, error } = await client
      .from('contact_submissions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as ContactSubmission[]) ?? [];
  },
};
