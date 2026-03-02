import type { SupabaseClient } from "@supabase/supabase-js";

export type DocumentType =
  | "clinical_note"
  | "prescription"
  | "referral_letter"
  | "discharge_summary"
  | "patient_handout"
  | "progress_note"
  | "specialist_consultation"
  | "transcript"
  | "other";

export interface ConsultationDocument {
  id: string;
  consultation_id: string;
  user_id: string;
  document_type: DocumentType;
  title: string;
  content_text: string | null;
  content_html: string | null;
  metadata: Record<string, unknown>;
  source_record_id: string | null;
  status: "active" | "archived" | "deleted";
  created_at: string;
  updated_at: string;
}

const TEMPLATE_TO_DOC_TYPE: Record<string, DocumentType> = {
  "SOAP Note": "clinical_note",
  "Referral Letter": "referral_letter",
  "Discharge Summary": "discharge_summary",
  "Progress Note": "progress_note",
  "Patient Handout": "patient_handout",
  "Specialist Consultation": "specialist_consultation",
};

export function templateToDocumentType(template: string): DocumentType {
  return TEMPLATE_TO_DOC_TYPE[template] || "clinical_note";
}

export async function ensureDocumentsTable(supabase: SupabaseClient): Promise<boolean> {
  const { error } = await supabase
    .from("consultation_documents")
    .select("id")
    .limit(1);

  return !error;
}

export async function saveDocument(
  supabase: SupabaseClient,
  params: {
    consultation_id: string;
    user_id: string;
    document_type: DocumentType;
    title: string;
    content_text?: string;
    content_html?: string;
    metadata?: Record<string, unknown>;
    source_record_id?: string;
  }
): Promise<ConsultationDocument | null> {
  const { data, error } = await supabase
    .from("consultation_documents")
    .insert({
      consultation_id: params.consultation_id,
      user_id: params.user_id,
      document_type: params.document_type,
      title: params.title,
      content_text: params.content_text || null,
      content_html: params.content_html || null,
      metadata: params.metadata || {},
      source_record_id: params.source_record_id || null,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    console.error("[Documents] Failed to save document:", error.message);
    return null;
  }

  return data as ConsultationDocument;
}

export async function listDocuments(
  supabase: SupabaseClient,
  consultationId: string
): Promise<ConsultationDocument[]> {
  const { data, error } = await supabase
    .from("consultation_documents")
    .select("*")
    .eq("consultation_id", consultationId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Documents] Failed to list documents:", error.message);
    return [];
  }

  return (data || []) as ConsultationDocument[];
}
