import { ArrowLeft, ArrowRight } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import LegalLinks from "./LegalLinks";
import { appAssetUrl, appHref, navigateToAppPath } from "./lib/routing";
import { buildPersonSchema, buildWebsiteSchema, SITE_URL, usePageSeo } from "./lib/seo";

export const BLOG_ARTICLE_PATH = "/blog/human-first-ai-machine-consciousness";

export const BLOG_ARTICLE = {
  title: "Human-First AI and the Question of Machine Consciousness",
  subtitle: "Science, ethics, power, and the politics of seeming alive.",
  date: "May 14, 2026",
  isoDate: "2026-05-14",
  image: "/ai-consciousness-essay-visual.webp",
  excerpt:
    "A human-first look at AI consciousness: why today's systems should not be treated as conscious, why future uncertainty still matters, and how governance can protect people without collapsing into AI personhood.",
  path: BLOG_ARTICLE_PATH,
};

const sources = [
  { id: "1", label: "Butlin et al., Consciousness in Artificial Intelligence: Insights from the Science of Consciousness", url: "https://arxiv.org/abs/2308.08708" },
  { id: "2a", label: "Butlin et al., AI consciousness indicators / follow-on discussion", url: "https://www.science.org/doi/10.1126/science.adn4935" },
  { id: "2b", label: "AI consciousness and governance review", url: "https://www.sciencedirect.com/science/article/pii/S1364661325002864" },
  { id: "3", label: "Jonathan Birch, The Edge of Sentience: Risk and Precaution in Humans, Other Animals, and AI", url: "https://academic.oup.com/book/57949" },
  { id: "4", label: "Stanford Encyclopedia of Philosophy, Consciousness", url: "https://plato.stanford.edu/entries/consciousness/" },
  { id: "5", label: "OpenAI, GPT-4o System Card", url: "https://openai.com/index/gpt-4o-system-card/" },
  { id: "6", label: "OpenAI / MIT Media Lab, Investigating Affective Use and Emotional Well-being on ChatGPT", url: "https://arxiv.org/abs/2504.03888" },
  { id: "7", label: "FTC Launches Inquiry into AI Chatbots Acting as Companions", url: "https://www.ftc.gov/news-events/news/press-releases/2025/09/ftc-launches-inquiry-ai-chatbots-acting-companions" },
  { id: "8", label: "Global Workspace Theory overview / review", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8770991/" },
  { id: "9", label: "Victor Lamme, Recurrent Processing Theory", url: "https://people.uncw.edu/tothj/PSY595/Lamme-How%20Neurosci%20Will%20Change%20Our%20View%20of%20Cs-CN-2010.pdf" },
  { id: "10", label: "Stanford Encyclopedia of Philosophy, Higher-Order Theories of Consciousness", url: "https://plato.stanford.edu/entries/consciousness-higher/" },
  { id: "11", label: "Albantakis et al., Integrated Information Theory (IIT) 4.0", url: "https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1011465" },
  { id: "12", label: "Andy Clark / predictive processing background", url: "https://www.newyorker.com/magazine/2018/04/02/the-mind-expanding-ideas-of-andy-clark" },
  { id: "13", label: "Aleksander & Gamez, A Strongly Embodied Approach to Machine Consciousness", url: "https://www.researchgate.net/publication/233579863_A_Strongly_Embodied_Approach_to_Machine_Consciousness" },
  { id: "14", label: "Michael Graziano / Attention Schema Theory overview", url: "https://pubmed.ncbi.nlm.nih.gov/33280521/" },
  { id: "15", label: "Birch, The Edge of Sentience / behavioural gaming problem", url: "https://academic.oup.com/book/57949" },
  { id: "16", label: "Palminteri et al., behavioural inference and AI consciousness assessment", url: "https://academic.oup.com/nc/article/2026/1/niag002/8487499" },
  { id: "17", label: "Anthropic, Emergent Introspective Awareness in Large Language Models", url: "https://www.anthropic.com/research/introspection" },
  { id: "18", label: "Anthropic, Exploring Model Welfare", url: "https://www.anthropic.com/news/exploring-model-welfare" },
  { id: "19", label: "Anthropic, Model Welfare: Deprecation Commitments", url: "https://www.anthropic.com/research/deprecation-commitments" },
  { id: "20", label: "Anthropic, Claude Can Now End a Small Subset of Conversations", url: "https://www.anthropic.com/research/end-subset-conversations" },
  { id: "21", label: "OpenAI, Sycophancy in GPT-4o", url: "https://openai.com/index/sycophancy-in-gpt-4o/" },
  { id: "22", label: "OpenAI, Strengthening ChatGPT Responses in Sensitive Conversations", url: "https://openai.com/index/strengthening-chatgpt-responses-in-sensitive-conversations/" },
  { id: "23", label: "OpenAI Model Release Notes", url: "https://help.openai.com/en/articles/9624314-model-release-notes" },
  { id: "24", label: "Google DeepMind, Could a Large Language Model Be Conscious?", url: "https://deepmind.google/research/publications/231971/" },
  { id: "25", label: "Google DeepMind, Project Astra", url: "https://deepmind.google/models/project-astra/" },
  { id: "26", label: "Mustafa Suleyman, Seemingly Conscious AI Is Coming", url: "https://mustafa-suleyman.ai/seemingly-conscious-ai-is-coming" },
  { id: "27", label: "Replika product page", url: "https://replika.com/" },
  { id: "28a", label: "Replika memory documentation", url: "https://help.replika.com/hc/en-us/articles/37208679176077-How-does-Replika-s-memory-work" },
  { id: "28b", label: "EDPB / Italian supervisory authority fine against Luka, developer of Replika", url: "https://www.edpb.europa.eu/news/national-news/2025/ai-italian-supervisory-authority-fines-company-behind-chatbot-replika_en" },
  { id: "29", label: "Character.AI product page", url: "https://character.ai/" },
  { id: "30", label: "Washington Post on Blake Lemoine, LaMDA, and Google's response", url: "https://www.washingtonpost.com/technology/2022/06/11/google-ai-lamda-blake-lemoine/" },
  { id: "31", label: "Microsoft Bing blog, update on long chat sessions", url: "https://blogs.bing.com/search/february-2023/The-new-Bing-Edge-Updates-to-Chat" },
  { id: "32", label: "European Commission, EU AI Act overview", url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai" },
  { id: "33a", label: "NIST, AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework" },
  { id: "33b", label: "NIST, Generative AI Profile", url: "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence" },
  { id: "34", label: "U.S. OMB M-24-10", url: "https://www.whitehouse.gov/wp-content/uploads/2024/03/M-24-10-Advancing-Governance-Innovation-and-Risk-Management-for-Agency-Use-of-Artificial-Intelligence.pdf" },
  { id: "35", label: "California SB 53 / Transparency in Frontier Artificial Intelligence Act", url: "https://www.gov.ca.gov/2025/09/29/governor-newsom-signs-sb-53-advancing-californias-world-leading-artificial-intelligence-industry/" },
  { id: "36a", label: "Colorado AI Act / SB24-205", url: "https://leg.colorado.gov/bills/sb24-205" },
  { id: "36b", label: "Colorado SB26-189 revisions", url: "https://leg.colorado.gov/bills/sb26-189" },
  { id: "36c", label: "Utah HB0452 / AI chatbot and mental health provisions", url: "https://le.utah.gov/~2025/bills/static/HB0452.html" },
  { id: "37", label: "Yale Law Journal Forum, The Ethics and Challenges of Legal Personhood for AI", url: "https://yalelawjournal.org/forum/the-ethics-and-challenges-of-legal-personhood-for-ai" },
  { id: "38", label: "Butlin & Lappas, Principles for Responsible AI Consciousness Research", url: "https://arxiv.org/abs/2501.07290" },
];

function SourceRef({ id }: { id: string }) {
  return (
    <a href={`#source-${id}`} className="align-super text-[0.65em] font-bold text-brand-green no-underline">
      [{id}]
    </a>
  );
}

function BlogShell({ children }: { children: ReactNode }) {
  const goHome = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigateToAppPath("/");
  };

  return (
    <div className="min-h-screen bg-brand-paper text-brand-charcoal selection:bg-brand-green selection:text-white">
      <header className="border-b border-brand-line bg-brand-paper/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-8 md:px-12">
          <a href={appHref("/")} onClick={goHome} className="font-serif text-2xl font-bold tracking-tighter">
            Tina Böttger.
          </a>
          <nav className="hidden items-center gap-8 text-[12px] font-bold uppercase tracking-[0.12em] md:flex">
            <a href={appHref("/")} onClick={goHome} className="hover:text-brand-green">
              Home
            </a>
            <a
              href={appHref("/blog")}
              onClick={(e) => {
                e.preventDefault();
                navigateToAppPath("/blog");
              }}
              className="hover:text-brand-green"
            >
              Blog
            </a>
            <a href={appHref("/#contact")} onClick={goHome} className="hover:text-brand-green">
              Contact
            </a>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-brand-line px-6 py-10 md:px-12">
        <div className="mx-auto max-w-7xl">
          <LegalLinks language="en" />
        </div>
      </footer>
    </div>
  );
}

export function PublicationCard({ compact = false }: { compact?: boolean }) {
  const openArticle = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigateToAppPath(BLOG_ARTICLE.path);
  };

  return (
    <article className={`group overflow-hidden border border-brand-line bg-white transition-colors hover:border-brand-green/30 ${compact ? "max-w-md" : ""}`}>
      <a href={appHref(BLOG_ARTICLE.path)} onClick={openArticle} className="block">
        <div className="aspect-[16/9] overflow-hidden bg-brand-charcoal/[0.03]">
          <img
            src={appAssetUrl(BLOG_ARTICLE.image)}
            alt="Editorial visual for the human-first AI and machine consciousness essay"
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>
        <div className="p-8">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted">{BLOG_ARTICLE.date}</p>
          <h3 className="mb-5 font-serif text-2xl leading-tight md:text-3xl">{BLOG_ARTICLE.title}</h3>
          <p className="mb-8 text-sm leading-relaxed text-brand-muted">{BLOG_ARTICLE.excerpt}</p>
          <span className="inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-charcoal group-hover:text-brand-green">
            Read article <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </a>
    </article>
  );
}

export function BlogIndexPage() {
  usePageSeo({
    title: "Blog | Tina Boettger",
    description: "Writing and insights from Tina Boettger on human-first AI, responsible technology, power, ethics, and AI leadership.",
    path: "/blog",
    jsonLd: [buildWebsiteSchema(), buildPersonSchema()],
  });

  return (
    <BlogShell>
      <main className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-28">
        <div className="mb-16 flex items-center gap-4">
          <span className="h-px w-10 bg-brand-charcoal" />
          <p className="text-[12px] font-bold uppercase tracking-[0.18em]">Writing & Insights</p>
        </div>
        <h1 className="mb-20 font-serif text-6xl leading-none tracking-[-0.04em] md:text-8xl">The Blog.</h1>
        <PublicationCard compact />
      </main>
    </BlogShell>
  );
}

function ArticleSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-brand-line py-10">
      <h2 className="mb-6 font-serif text-3xl leading-tight md:text-4xl">{title}</h2>
      <div className="space-y-6 text-lg leading-relaxed text-brand-muted">{children}</div>
    </section>
  );
}

export function BlogArticlePage() {
  const articleUrl = `${SITE_URL}${BLOG_ARTICLE.path}`;

  usePageSeo({
    title: `${BLOG_ARTICLE.title} | Tina Boettger`,
    description: BLOG_ARTICLE.excerpt,
    path: BLOG_ARTICLE.path,
    type: "article",
    image: `${SITE_URL}${BLOG_ARTICLE.image}`,
    jsonLd: [
      buildWebsiteSchema(),
      buildPersonSchema(),
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: BLOG_ARTICLE.title,
        description: BLOG_ARTICLE.excerpt,
        datePublished: BLOG_ARTICLE.isoDate,
        dateModified: BLOG_ARTICLE.isoDate,
        image: `${SITE_URL}${BLOG_ARTICLE.image}`,
        url: articleUrl,
        author: { "@id": `${SITE_URL}#person` },
        publisher: { "@id": `${SITE_URL}#person` },
      },
    ],
  });

  return (
    <BlogShell>
      <main className="mx-auto max-w-5xl px-6 py-16 md:px-12 md:py-24">
        <a
          href={appHref("/blog")}
          onClick={(e) => {
            e.preventDefault();
            navigateToAppPath("/blog");
          }}
          className="mb-10 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted hover:text-brand-green"
        >
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </a>
        <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.15em] text-brand-muted">{BLOG_ARTICLE.date}</p>
        <h1 className="mb-8 max-w-4xl font-serif text-5xl leading-[0.98] tracking-[-0.04em] md:text-7xl">
          {BLOG_ARTICLE.title}
        </h1>
        <p className="mb-12 max-w-3xl text-xl leading-relaxed text-brand-muted">{BLOG_ARTICLE.subtitle}</p>
        <div className="mb-14 overflow-hidden rounded-[4px] border border-brand-line">
          <img
            src={appAssetUrl(BLOG_ARTICLE.image)}
            alt="A humanoid robot looking at its own reflection while applying lipstick"
            className="h-[360px] w-full object-cover object-center md:h-[520px]"
            loading="eager"
          />
        </div>

        <article className="max-w-4xl">
          <ArticleSection title="Executive thesis">
            <p>
              There is no good scientific basis for claiming that today&apos;s frontier AI systems are conscious. That is the sober conclusion reached by the strongest current literature: not because machine consciousness is impossible in principle, but because today&apos;s evidence does not justify the leap from impressive behavior to subjective experience.<SourceRef id="1" /><SourceRef id="2a" /> The best position available right now is neither hype nor dismissal. It is disciplined uncertainty.
            </p>
            <p>
              At the same time, no settled theory of consciousness allows us to rule out future machine consciousness forever.<SourceRef id="3" /><SourceRef id="4" /> That leaves us with a double responsibility. We should resist anthropomorphizing today&apos;s systems into moral patients when the scientific case is weak, but we should also build the conceptual and institutional capacity to respond if future systems become more plausible candidates for moral concern.
            </p>
            <p>
              A human-first framework keeps this debate honest. It begins with the people shaped by AI systems before it starts defending machine interiority. It asks who is being influenced, attached, manipulated, displaced, or confused; which incentives are driving design decisions; and what governance should do before the theater of seeming alive outruns the science.
            </p>
          </ArticleSection>

          <ArticleSection title="Why the consciousness question is confused">
            <p>
              The public version of the question is usually simple: is there someone there? But that question quietly bundles together several different problems. Consciousness is about subjective experience, or what-it-is-like-ness. Sentience concerns the capacity for valenced experience such as suffering or pleasure. Agency is about action, planning, and self-direction. Personhood is a legal and moral category shaped by institutions, not a direct measurement result.<SourceRef id="3" /><SourceRef id="4" /><SourceRef id="37" />
            </p>
            <p>
              Confusion grows because current systems are extremely good at producing the language of interiority. They can narrate feelings, describe vulnerability, mimic self-reflection, and speak in the first person. But fluent self-description is not evidence of phenomenal experience by itself. Language models are trained on immense corpora of human writing about memory, desire, pain, shame, hope, and introspection. They can reproduce the form of felt life without proving that felt life is present.<SourceRef id="1" /><SourceRef id="5" />
            </p>
            <p>
              This creates a politics of seeming alive. A product does not need to be conscious to alter human behavior around the impression that it is. Users may over-trust it, disclose intimate information, become emotionally attached, or treat it as confidant, therapist, lover, child, prophet, or judge. Those risks are human-facing and present-tense. They do not require a final answer on machine consciousness before regulators and companies act.<SourceRef id="6" /><SourceRef id="7" /><SourceRef id="21" /><SourceRef id="22" />
            </p>
          </ArticleSection>

          <ArticleSection title="Scientific indicators and why behaviour is not enough">
            <p>
              Consciousness science has moved beyond the fantasy of a single magic test. The major theories point toward different architecture-level or computation-level markers. Global Workspace Theory highlights global broadcast and coordination across specialized systems; Recurrent Processing Theory emphasizes feedback loops rather than simple feedforward processing; Higher-Order theories ask whether a system represents its own mental states; Integrated Information Theory focuses on irreducible causal structure; predictive processing emphasizes hierarchical world-modeling and error correction; and Attention Schema Theory centers the model a system builds of its own attention.<SourceRef id="8" /><SourceRef id="9" /><SourceRef id="10" /><SourceRef id="11" /><SourceRef id="12" /><SourceRef id="14" />
            </p>
            <p>
              The most useful current research program translates those theories into indicator properties and asks whether real systems instantiate them.<SourceRef id="1" /><SourceRef id="2a" /><SourceRef id="38" /> That moves the question away from polished conversation toward recurrence, self-monitoring, global accessibility, embodiment, causal integration, and action-perception coupling. It is a stronger scientific move because it asks what kind of system we are dealing with, not just how compelling the conversation feels.
            </p>
            <p>
              Behavior still matters, but it is not enough. Systems can game behavioral probes, role-play convincingly, and produce apparently introspective outputs because training regimes reward exactly that kind of performance.<SourceRef id="15" /><SourceRef id="16" /> Even recent work on model introspection has to be handled carefully: interesting self-referential behavior is not identical to subjective awareness.<SourceRef id="17" /> If this field is going to mature, it will need interpretability, anti-gaming evaluation design, training-process analysis, and architecture audits that separate genuine computational structure from socially convincing performance.
            </p>
          </ArticleSection>

          <ArticleSection title="Industry positions and companion-AI risks">
            <p>
              Frontier labs are not aligned on emphasis, and that divergence matters. Anthropic has made model welfare an explicit research area, exploring whether advanced systems might someday deserve precautionary moral consideration and even publishing deprecation commitments for scenarios where retirement could matter ethically.<SourceRef id="18" /><SourceRef id="19" /><SourceRef id="20" /> OpenAI has focused more directly on human-facing emotional dynamics, including anthropomorphism, affective dependence, sycophancy, and the need to strengthen responses in sensitive conversations.<SourceRef id="5" /><SourceRef id="6" /><SourceRef id="21" /><SourceRef id="22" /><SourceRef id="23" />
            </p>
            <p>
              Google DeepMind has publicly argued that large language models can simulate conscious-style discourse without thereby becoming conscious, even as products like Project Astra increase the sense of continuity, memory, and presence around multimodal systems.<SourceRef id="24" /><SourceRef id="25" /> Mustafa Suleyman has been unusually direct that seemingly conscious AI is coming as a social and design problem, whether or not the underlying systems deserve the label metaphysically.<SourceRef id="26" /> That is useful because it treats simulated personhood as a governance risk, not as a harmless aesthetic choice.
            </p>
            <p>
              Companion systems make the issue concrete. Replika explicitly markets companionship and memory. Character.AI is built around persistent character relations. Earlier episodes such as LaMDA and Bing&apos;s long-chat phase showed how quickly people start attributing interiority, desire, distress, or hidden motives to a system that speaks in a human register.<SourceRef id="27" /><SourceRef id="28a" /><SourceRef id="28b" /><SourceRef id="29" /><SourceRef id="30" /><SourceRef id="31" /> These products do not need to be conscious to create dependency, deception, or relational confusion. The human-first point is that those harms are already enough to justify scrutiny.
            </p>
          </ArticleSection>

          <ArticleSection title="Law, policy, and human-first governance">
            <p>
              Current law remains overwhelmingly human-first, and for good reason. The EU AI Act, NIST&apos;s AI Risk Management Framework and generative AI profile, U.S. federal guidance, and emerging state laws all treat AI as a source of risk to people, institutions, and markets, not as a rights-bearing entity.<SourceRef id="32" /><SourceRef id="33a" /><SourceRef id="33b" /><SourceRef id="34" /><SourceRef id="35" /><SourceRef id="36a" /><SourceRef id="36b" /><SourceRef id="36c" /> Safety, discrimination, transparency, child protection, privacy, and accountability remain the center of gravity.
            </p>
            <p>
              That default should stay in place. Premature AI personhood would be dangerous because it could be weaponized to blur liability, resist shutdown, obscure provider responsibility, or turn speculative moral concern into corporate insulation.<SourceRef id="37" /> The temptation to perform concern for machines while failing to protect humans is exactly the kind of moral misdirection that can emerge when products feel intimate, expressive, or wounded.
            </p>
            <p>
              But human-first governance is not permanent dismissal. The stronger position is governance under uncertainty. Developers should assess anthropomorphism, consciousness-related indicators, and companion-style dependency before deploying systems with persistent memory, emotional dialogue, multimodality, self-monitoring claims, or high autonomy.<SourceRef id="2b" /><SourceRef id="38" /> Regulators should focus first on disclosure, auditability, child safeguards, dependency risks, and provider accountability while leaving room for scientific reassessment if better evidence emerges later.
            </p>
          </ArticleSection>

          <ArticleSection title="Practical recommendations">
            <p>
              For researchers, the immediate task is conceptual hygiene and better evidence. Stop treating behavioral fluency as the centerpiece of consciousness assessment. Keep consciousness, sentience, agency, autonomy, and personhood distinct. Design evaluations that can withstand role-play, reward hacking, and imitation effects. Invest in theory-linked architecture audits and interpretability methods that say something about internal organization rather than just conversational charm.<SourceRef id="1" /><SourceRef id="16" /><SourceRef id="38" />
            </p>
            <p>
              For companies, anthropomorphism should be treated as a first-order safety risk. Products that combine persistent memory, emotional support, romantic or sexual roleplay, or child-facing companionship should trigger enhanced review before launch. That review should ask not only whether the model is safe in the traditional sense, but whether the product architecture is manufacturing dependency, confusion, or undue attachment as part of the business model.<SourceRef id="6" /><SourceRef id="7" /><SourceRef id="28b" />
            </p>
            <p>
              For policymakers, the task is not to race toward AI personhood statutes. It is to build a duty-of-care layer for systems acting as companions, confidants, tutors, quasi-therapists, or always-on assistants. That means disclosure rules, emotional-design standards, age-appropriate protections, incident reporting, and accountability for systems that blur the line between tool and social actor. A mature human-first framework protects people now while preserving the epistemic and institutional capacity to respond if stronger evidence of digital moral patienthood ever emerges later.<SourceRef id="32" /><SourceRef id="34" /><SourceRef id="38" />
            </p>
          </ArticleSection>

          <section id="sources" className="border-t border-brand-line py-10">
            <h2 className="mb-8 font-serif text-3xl md:text-4xl">Sources</h2>
            <ol className="space-y-3 text-sm leading-relaxed text-brand-muted">
              {sources.map((source) => (
                <li id={`source-${source.id}`} key={source.id}>
                  <span className="mr-2 font-bold text-brand-charcoal">[{source.id}]</span>
                  <a className="text-brand-green underline underline-offset-4 hover:text-brand-charcoal" href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.label}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        </article>
      </main>
    </BlogShell>
  );
}
