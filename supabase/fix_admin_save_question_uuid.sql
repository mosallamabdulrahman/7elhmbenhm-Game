-- ==============================================================================
-- Migration: Fix admin_save_question uuid type error for string category IDs
-- Description: The original function expected `p_category_id uuid`, which throws
--              "invalid input syntax for type uuid" when saving questions in categories
--              with text slugs/IDs like 'wla_kelma', 'geography', 'history', etc.
-- ==============================================================================

-- 1. إسقاط التوقيع القديم للدالة التي كانت تستقبل p_category_id كـ uuid
DROP FUNCTION IF EXISTS public.admin_save_question(
  uuid, uuid, text, text, text, integer, integer, boolean, text, text, integer, integer, text
);
DROP FUNCTION IF EXISTS public.admin_save_question(
  uuid, text, text, text, text, integer, integer, boolean, text, text, integer, integer, text
);
DROP FUNCTION IF EXISTS public.admin_save_question(
  uuid, text, text, text, text, integer, integer, boolean, text, text, integer, integer, text, boolean
);

-- 2. إعادة إنشاء دالة admin_save_question بنوع text لمعرف الفئة p_category_id
CREATE OR REPLACE FUNCTION public.admin_save_question(
  p_id uuid,
  p_category_id text,
  p_question_text text,
  p_answer_text text,
  p_difficulty text,
  p_strikes integer,
  p_position integer,
  p_is_active boolean,
  p_media_url text,
  p_media_type text,
  p_image_duration integer,
  p_media_play_count integer,
  p_answer_image_url text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_points integer;
  v_id     uuid;
BEGIN
  -- التحقق من صلاحية المدير
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'غير مصرح لك بهذه العملية';
  END IF;

  -- استنتاج النقاط تلقائياً بناءً على الصعوبة
  v_points := CASE lower(p_difficulty)
                WHEN 'easy'   THEN 200
                WHEN 'medium' THEN 400
                WHEN 'hard'   THEN 600
                ELSE NULL
              END;

  IF v_points IS NULL THEN
    RAISE EXCEPTION 'صعوبة غير معروفة: %', p_difficulty;
  END IF;

  -- إضافة سؤال جديد إذا لم يكن هناك p_id
  IF p_id IS NULL THEN
    INSERT INTO public.question_bank (
      category_id,
      question_text,
      answer_text,
      difficulty,
      strikes,
      points,
      position,
      is_active,
      media_url,
      media_type,
      image_duration,
      media_play_count,
      answer_image_url
    )
    VALUES (
      p_category_id,
      p_question_text,
      p_answer_text,
      p_difficulty,
      p_strikes,
      v_points,
      p_position,
      p_is_active,
      p_media_url,
      p_media_type,
      p_image_duration,
      p_media_play_count,
      p_answer_image_url
    )
    RETURNING id INTO v_id;
  ELSE
    -- تحديث السؤال الحالي
    UPDATE public.question_bank SET
      category_id      = p_category_id,
      question_text    = p_question_text,
      answer_text      = p_answer_text,
      difficulty       = p_difficulty,
      strikes          = p_strikes,
      points           = v_points,
      position         = p_position,
      is_active        = p_is_active,
      media_url        = p_media_url,
      media_type       = p_media_type,
      image_duration   = p_image_duration,
      media_play_count = p_media_play_count,
      answer_image_url = p_answer_image_url,
      updated_at       = now()
    WHERE id = p_id;
    v_id := p_id;
  END IF;

  RETURN v_id;
END;
$function$;
