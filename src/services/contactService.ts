import { requireSupabase } from '@/lib/supabase';
import { uuid } from '@/lib/utils';
import type { ContactSubmission, ContactAttachment } from '@/types';
import type { ContactFormValues } from '@/schemas/contact';
import { getContactPayload } from '@/schemas/contact';

const MAX_PDF_BYTES = 5 * 1024 * 1024;

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
    const {
      data: { session },
    } = await client.auth.getSession();

    const payload = getContactPayload(form);

    const { data: submissionData, error: submissionError } = await client
      .from('contact_submissions')
      .insert({
        user_id: session?.user.id ?? null,
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
      if (attachment.type !== 'application/pdf') {
        throw new Error('contact.fileMustBePdf');
      }
      if (attachment.size > MAX_PDF_BYTES) {
        throw new Error('contact.fileTooLarge');
      }

      const storagePath = `${submissionData.id}/${uuid()}.pdf`;
      const { error: uploadError } = await client.storage
        .from('contact-attachments')
        .upload(storagePath, attachment, { contentType: 'application/pdf', upsert: false });
      if (uploadError) throw uploadError;

      const { data: attachData, error: attachError } = await client
        .from('contact_attachments')
        .insert({
          submission_id: submissionData.id,
          storage_path: storagePath,
          mime_type: 'application/pdf',
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
