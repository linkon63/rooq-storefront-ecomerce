"use client";

import { PageHeader } from "../../../_components/admin-shell";
import { SettingsCard } from "../_components/settings-ui";
import { HeroModeCard } from "./_components/hero-mode-card";
import { SlideCard } from "./_components/slide-card";
import { UploadCard } from "./_components/upload-card";
import { useHeroSlides } from "./_hooks/use-hero-slides";

/** Home hero: choose slider or campaign, and manage the slider's images and their product links. */
export default function HeroSliderPage() {
  const { slides, mode, loading, busy, setMode, upload, update, remove, move } = useHeroSlides();

  return (
    <>
      <PageHeader title="Hero Slider" description="What shoppers see first on the home page." />
      <div className="grid gap-6">
        <SettingsCard title="Hero shows" description="Pick one. If the one you pick has nothing to show, the other is used.">
          <HeroModeCard busy={busy || loading} mode={mode} onChange={(next) => void setMode(next)} />
        </SettingsCard>
        <SettingsCard
          title="Slides"
          description="Each image is one slide, shown in this order. Link a product and its name, price and a View details link appear in the hero corner while that slide is in focus."
        >
          <div className="grid gap-6">
            <UploadCard busy={busy} onUpload={upload} />
            {loading ? (
              <p className="text-sm font-medium text-slate-400">Loading slides…</p>
            ) : slides.length === 0 ? (
              <p className="text-sm font-medium text-slate-500">No slides yet. Add the first image above.</p>
            ) : (
              <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {slides.map((slide, index) => (
                  <SlideCard
                    key={slide.id}
                    slide={slide}
                    index={index}
                    count={slides.length}
                    busy={busy}
                    onUpdate={(patch) => void update(slide.id, patch)}
                    onMove={(step) => void move(index, step)}
                    onRemove={() => void remove(slide.id)}
                  />
                ))}
              </ol>
            )}
          </div>
        </SettingsCard>
      </div>
    </>
  );
}
