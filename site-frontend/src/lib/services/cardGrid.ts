// Shared "editorial grid" for card collections on a service page —
// Diferenciais (ServiceBenefits) and Abrangência (ServiceAudience) today,
// any equivalent list tomorrow. Same flex-wrap + justify-center technique
// already used by the Home's ServicesSection.tsx: CSS grid always
// left-anchors a trailing incomplete row (which is what made 4 items read
// as "3 cards + 1 orphan"), flex with justify-center centers it instead —
// works for any count without a rule per quantity.
//
// Column count itself also adapts to how many cards exist: ≤4 cards read
// better as a wide 2-column layout (2, or 2+1 centered, or 2×2) than a
// cramped/awkward 3+1; 5+ cards switch to 3 columns (3+2, 3+3, ...) so the
// section doesn't grow too tall. One threshold, not a special case per
// quantity — the centering above handles every remainder within either
// column count automatically.
export function serviceCardGridClasses(count: number) {
  const lgColumns = count <= 4 ? 2 : 3;
  const lgBasis = lgColumns === 3 ? "lg:basis-[calc(33.333%-1rem)]" : "lg:basis-[calc(50%-0.75rem)]";
  return {
    container: "flex flex-wrap justify-center gap-6",
    item: `w-full max-w-[420px] shrink-0 grow-0 sm:basis-[calc(50%-0.75rem)] ${lgBasis}`,
  };
}
