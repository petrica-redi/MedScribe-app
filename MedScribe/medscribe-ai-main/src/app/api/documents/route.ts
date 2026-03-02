import { createClient } from "@/lib/supabase/server";
import { listDocuments, saveDocument, type DocumentType } from "@/lib/documents";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const consultationId = searchParams.get("consultation_id");

    if (!consultationId) {
      return NextResponse.json({ error: "consultation_id required" }, { status: 400 });
    }

    const { data: consultation } = await supabase
      .from("consultations")
      .select("id")
      .eq("id", consultationId)
      .eq("user_id", user.id)
      .single();

    if (!consultation) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
    }

    const documents = await listDocuments(supabase, consultationId);
    return NextResponse.json({ documents });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { consultation_id, document_type, title, content_text, content_html, metadata, source_record_id } = body;

    if (!consultation_id || !document_type || !title) {
      return NextResponse.json(
        { error: "consultation_id, document_type, and title are required" },
        { status: 400 }
      );
    }

    const { data: consultation } = await supabase
      .from("consultations")
      .select("id")
      .eq("id", consultation_id)
      .eq("user_id", user.id)
      .single();

    if (!consultation) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
    }

    const doc = await saveDocument(supabase, {
      consultation_id,
      user_id: user.id,
      document_type: document_type as DocumentType,
      title,
      content_text,
      content_html,
      metadata,
      source_record_id,
    });

    if (!doc) {
      return NextResponse.json({ error: "Failed to save document" }, { status: 500 });
    }

    return NextResponse.json(doc, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
