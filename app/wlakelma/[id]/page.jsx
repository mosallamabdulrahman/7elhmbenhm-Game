import Image from "next/image";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  return {
    title: "ولا كلمة | حيلهم بينهم",
    description: "صفحة عرض السؤال لفئة ولا كلمة",
  };
}

export default async function WlaKelmaPage({ params }) {
  const resolvedParams = await params;
  const questionId = resolvedParams?.id;

  let answerText = "";
  let answerImageUrl = "";
  let found = false;

  if (questionId) {
    try {
      const supabaseAdmin = getSupabaseAdmin();

      // 1. Try fetching from room_question_answers (live game)
      const { data: roomAnswer } = await supabaseAdmin
        .from("room_question_answers")
        .select("answer_text, answer_image_url")
        .eq("question_id", questionId)
        .maybeSingle();

      if (roomAnswer) {
        answerText = roomAnswer.answer_text || "";
        answerImageUrl = roomAnswer.answer_image_url || "";
        found = true;
      } else {
        // 2. Fallback: try room_questions directly (if answer is stored there or joined)
        const { data: roomQ } = await supabaseAdmin
          .from("room_questions")
          .select("answer_text, answer_image_url, question_text")
          .eq("id", questionId)
          .maybeSingle();

        if (roomQ) {
          answerText = roomQ.answer_text || roomQ.question_text || "";
          answerImageUrl = roomQ.answer_image_url || "";
          found = true;
        } else {
          // 3. Fallback: try question_bank (for testing / admin preview)
          const { data: bankQ } = await supabaseAdmin
            .from("question_bank")
            .select("answer_text, answer_image_url, question_text")
            .eq("id", questionId)
            .maybeSingle();

          if (bankQ) {
            answerText = bankQ.answer_text || bankQ.question_text || "";
            answerImageUrl = bankQ.answer_image_url || "";
            found = true;
          }
        }
      }
    } catch (err) {
      console.error("Error fetching wlakelma question:", err);
    }
  }

  return (
    <div
      dir="rtl"
      className="min-h-[100dvh] bg-[#f0f4f8] flex items-center justify-center p-4 sm:p-6 text-slate-900 font-sans select-none"
    >
      {/* Main Card Container with Cyan Border matching Game Screen (Screenshot 1) */}
      <div className="relative w-full max-w-md bg-white border-4 border-cyan-500 rounded-[2.2rem] sm:rounded-[2.8rem] pt-8 sm:pt-10 pb-6 px-4 sm:px-6 flex flex-col items-center text-center shadow-2xl my-auto">
        {/* Game Logo positioned directly on the top border line (matching Screenshot 2) */}
        <div className="absolute -top-8 sm:-top-10 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-0.5 rounded-2xl z-20 flex items-center justify-center">
          <Image
            src="/images/logo.png"
            alt="حيلهم بينهم"
            width={130}
            height={55}
            priority
            className="h-14 sm:h-16 w-auto object-contain"
          />
        </div>

        {found ? (
          <div className="w-full flex flex-col items-center">
            {/* Title / Headline: e.g. "مسلسل: ولاد الشمس" */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug mt-2 mb-4 px-2">
              {answerText}
            </h1>

            {/* Poster / Secret Image */}
            {answerImageUrl ? (
              <div className="w-full flex justify-center">
                <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-50 flex items-center justify-center">
                  <img
                    src={answerImageUrl}
                    alt={answerText || "صورة ولا كلمة"}
                    className="w-full h-auto max-h-[62vh] object-contain mx-auto rounded-2xl"
                    loading="eager"
                  />
                </div>
              </div>
            ) : (
              <div className="w-full p-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 text-xs font-bold">
                لا توجد صورة مخصصة لهذا السؤال
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center space-y-3">
            <span className="text-4xl">⚠️</span>
            <h2 className="text-base font-bold text-slate-800">
              لم يتم العثور على بيانات السؤال
            </h2>
            <p className="text-xs text-slate-400 max-w-xs">
              تأكد من مسح الباركود الصحيح من شاشة الحكم أثناء الجولة.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
