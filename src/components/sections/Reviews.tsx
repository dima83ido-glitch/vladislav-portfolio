import { getTranslations } from "next-intl/server";
import { FiStar } from "react-icons/fi";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ReviewsWriteButton } from "@/components/sections/ReviewForm";
import { getApprovedReviews } from "@/db/queries/reviews";

export async function Reviews() {
  const t = await getTranslations("reviews");
  const reviews = await getApprovedReviews();

  return (
    <section id="reviews" className="relative py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          italicWord={t("italicWord")}
          align="center"
          className="mx-auto items-center text-center"
          description={t("description")}
        />

        {reviews.length > 0 ? (
          <div className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, i) => (
              <Reveal key={review.id} variant="up" delay={(i % 3) * 0.1}>
                <div className="flex h-full flex-col gap-4 rounded-2xl border border-line bg-surface/60 p-7">
                  <div className="flex items-center gap-1 text-blue-soft">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <FiStar
                        key={starIndex}
                        size={14}
                        fill={starIndex < review.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-muted">
                    &ldquo;{review.body}&rdquo;
                  </p>
                  <span className="text-sm font-semibold text-foreground">
                    {review.authorName}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal variant="up" delay={0.1} className="mt-16 text-center">
            <p className="text-sm text-muted">{t("empty")}</p>
          </Reveal>
        )}

        <Reveal variant="scale" delay={0.15} className="mt-14 flex justify-center">
          <ReviewsWriteButton />
        </Reveal>
      </div>
    </section>
  );
}
