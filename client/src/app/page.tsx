import { FullPageSection } from '@/features/layout'
import {
  AboutSection,
  HeroSection,
  PostsSection,
  ResumeSection,
  SocialsSection,
  WorksSection,
} from '@/features/home'

export default function HomePage() {
  return (
    <>
      <FullPageSection id="hero" width="wide" align="start">
        <HeroSection />
      </FullPageSection>

      <FullPageSection
        id="about"
        width="wide"
        align="center"
        tintColor="rgb(var(--glow-secondary) / 0.18)"
      >
        <AboutSection />
      </FullPageSection>

      <FullPageSection
        id="resume"
        width="wide"
        align="center"
        tintColor="rgb(var(--glow) / 0.12)"
      >
        <ResumeSection />
      </FullPageSection>

      <FullPageSection
        id="works"
        width="wide"
        align="center"
        tintColor="rgb(var(--glow-secondary) / 0.22)"
      >
        <WorksSection />
      </FullPageSection>

      <FullPageSection
        id="socials"
        width="wide"
        align="center"
        tintColor="rgb(var(--glow) / 0.1)"
      >
        <SocialsSection />
      </FullPageSection>

      <FullPageSection id="posts" width="wide" align="center">
        <PostsSection />
      </FullPageSection>
    </>
  )
}
