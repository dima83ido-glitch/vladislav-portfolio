import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  italicWord?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  italicWord,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  const titleParts = italicWord ? title.split(italicWord) : [title];

  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "center" && "items-center text-center",
        className
      )}
    >
      <Reveal variant="up" duration={0.6}>
        <span className="flex items-center gap-3 text-sm font-medium uppercase tracking-[0.3em] text-blue-soft">
          <span className="h-px w-8 bg-blue-soft/60" />
          {eyebrow}
        </span>
      </Reveal>
      <h2
        className={cn(
          "max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl",
          align === "center" && "mx-auto"
        )}
      >
        {italicWord ? (
          <>
            <RevealText text={titleParts[0]?.trim() ?? ""} as="span" />{" "}
            <RevealText
              text={italicWord}
              as="span"
              wordClassName="font-serif-italic font-normal text-blue-soft"
              delay={0.15}
            />{" "}
            <RevealText text={titleParts[1]?.trim() ?? ""} as="span" delay={0.25} />
          </>
        ) : (
          <RevealText text={title} as="span" />
        )}
      </h2>
      {description ? (
        <Reveal variant="up" delay={0.15} duration={0.6}>
          <p
            className={cn(
              "max-w-xl text-base leading-relaxed text-muted sm:text-lg",
              align === "center" && "mx-auto"
            )}
          >
            {description}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
