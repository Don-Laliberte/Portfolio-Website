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
      <FullPageSection id="hero">
        <HeroSection />
      </FullPageSection>
      <FullPageSection id="about">
        <AboutSection />
      </FullPageSection>
      <FullPageSection id="resume">
        <ResumeSection />
      </FullPageSection>
      <FullPageSection id="works">
        <WorksSection />
      </FullPageSection>
      <FullPageSection id="socials">
        <SocialsSection />
      </FullPageSection>
      <FullPageSection id="posts">
        <PostsSection />
      </FullPageSection>
    </>
  )
}
