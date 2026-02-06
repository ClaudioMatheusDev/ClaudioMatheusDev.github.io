import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Ver Projetos 📂
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="https://github.com/ClaudioMatheusDev"
            style={{marginLeft: '1rem'}}>
            GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

function AboutSection() {
  return (
    <section className={styles.aboutSection}>
      <div className="container">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <Heading as="h2" className="text--center margin-bottom--lg">
              Sobre Mim
            </Heading>
            <p className="text--center" style={{fontSize: '1.2rem'}}>
              Desenvolvedor apaixonado por tecnologia e código limpo.
              Aqui você encontra meus projetos e documentações técnicas.
            </p>
            <p className="text--center">
              🚀 Especializado em desenvolvimento back end<br/>
              💡 Sempre buscando aprender novas tecnologias<br/>
              📚 Compartilhando conhecimento através de documentações
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectsSection() {
  const projects = [
    {
      title: 'Work Session Tracker',
      description: 'Aplicação para registrar sessões de trabalho',
      link: '/docs/projetos/WorkSessionTracker',
      tags: ['React', 'ASP.NET', 'SQL Server']
    }
  ];

  return (
    <section className={styles.projectsSection}>
      <div className="container">
        <Heading as="h2" className="text--center margin-bottom--lg">
          Meus Projetos
        </Heading>
        <div className="row">
          {projects.map((project, idx) => (
            <div key={idx} className="col col--4 margin-bottom--lg">
              <div className={clsx('card', styles.projectCard)}>
                <div className="card__header">
                  <Heading as="h3">{project.title}</Heading>
                </div>
                <div className="card__body">
                  <p>{project.description}</p>
                  <div className={styles.projectTags}>
                    {project.tags.map((tag, i) => (
                      <span key={i} className="badge badge--primary margin-right--sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="card__footer">
                  <Link
                    className="button button--primary button--block"
                    to={project.link}>
                    Ver Documentação
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Portfólio - ${siteConfig.title}`}
      description="Portfólio de projetos e documentações">
      <HomepageHeader />
      <main>
        <AboutSection />
        <ProjectsSection />
      </main>
    </Layout>
  );
}
