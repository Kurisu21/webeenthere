// elements/renderers/enhancedRenderers.tsx
import React from 'react';
import { HeroElement, NavigationElement, GalleryElement, ServicesElement, StatsElement, FooterElement } from '../enhancedElements';

interface EnhancedRendererProps {
  element: HeroElement | NavigationElement | GalleryElement | ServicesElement | StatsElement | FooterElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
}

export const HeroRenderer: React.FC<EnhancedRendererProps> = ({ element, isSelected, onSelect, onUpdate }) => {
  const heroElement = element as HeroElement;
  
  return (
    <div
      className={`hero-element ${isSelected ? 'selected' : ''}`}
      style={{
        ...element.styles,
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}
      onClick={onSelect}
    >
      {/* Navigation */}
      <nav style={{
        position: 'absolute',
        top: '20px',
        left: '0',
        right: '0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 40px',
        zIndex: 10
      }}>
        <div style={{ fontSize: '24px', fontWeight: '700' }}>
          {heroElement.heroContent.title.split(' ')[0]}
        </div>
        <div style={{ display: 'flex', gap: '30px' }}>
          <a href="#about" style={{ color: 'white', textDecoration: 'none' }}>About</a>
          <a href="#work" style={{ color: 'white', textDecoration: 'none' }}>Work</a>
          <a href="#contact" style={{ color: 'white', textDecoration: 'none' }}>Contact</a>
        </div>
      </nav>

      {/* Hero Content */}
      <div style={{ textAlign: 'center', zIndex: 5 }}>
        <h1 style={{ 
          fontSize: '4rem', 
          fontWeight: '700', 
          marginBottom: '20px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          {heroElement.heroContent.title}
        </h1>
        <p style={{ 
          fontSize: '1.5rem', 
          marginBottom: '40px', 
          opacity: 0.9 
        }}>
          {heroElement.heroContent.subtitle}
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          {heroElement.heroContent.buttons.map((button, index) => (
            <button
              key={index}
              style={{
                padding: '15px 30px',
                border: 'none',
                borderRadius: '50px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                background: button.type === 'primary' ? 'white' : 'transparent',
                color: button.type === 'primary' ? '#667eea' : 'white',
                border: button.type === 'secondary' ? '2px solid white' : 'none'
              }}
            >
              {button.text}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '2px',
        height: '30px',
        background: 'white',
        opacity: 0.7
      }}>
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '-4px',
          width: '10px',
          height: '10px',
          borderRight: '2px solid white',
          borderBottom: '2px solid white',
          transform: 'rotate(45deg)'
        }} />
      </div>
    </div>
  );
};

export const NavigationRenderer: React.FC<EnhancedRendererProps> = ({ element, isSelected, onSelect, onUpdate }) => {
  const navElement = element as NavigationElement;
  
  return (
    <nav
      className={`nav-element ${isSelected ? 'selected' : ''}`}
      style={{
        ...element.styles,
        position: 'relative',
        width: '100%',
        height: '100%'
      }}
      onClick={onSelect}
    >
      <div style={{ fontSize: '24px', fontWeight: '700' }}>
        {navElement.navContent.logo}
      </div>
      <div style={{ display: 'flex', gap: '30px' }}>
        {navElement.navContent.links.map((link, index) => (
          <a
            key={index}
            href={link.href}
            style={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'opacity 0.3s'
            }}
          >
            {link.text}
          </a>
        ))}
      </div>
    </nav>
  );
};

export const GalleryRenderer: React.FC<EnhancedRendererProps> = ({ element, isSelected, onSelect, onUpdate }) => {
  const galleryElement = element as GalleryElement;
  
  return (
    <section
      className={`gallery-element ${isSelected ? 'selected' : ''}`}
      style={{
        ...element.styles,
        position: 'relative',
        width: '100%',
        height: '100%'
      }}
      onClick={onSelect}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '3rem',
          marginBottom: '60px',
          color: '#2c3e50'
        }}>
          {galleryElement.galleryContent.title}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px'
        }}>
          {galleryElement.galleryContent.items.map((item, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                borderRadius: '15px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s'
              }}
            >
              <div
                style={{
                  height: '200px',
                  background: item.gradient || 'linear-gradient(45deg, #ff6b6b, #4ecdc4)'
                }}
              />
              <div style={{ padding: '20px' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  marginBottom: '10px',
                  color: '#2c3e50'
                }}>
                  {item.title}
                </h3>
                <p style={{ color: '#666' }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const ServicesRenderer: React.FC<EnhancedRendererProps> = ({ element, isSelected, onSelect, onUpdate }) => {
  const servicesElement = element as ServicesElement;
  
  return (
    <section
      className={`services-element ${isSelected ? 'selected' : ''}`}
      style={{
        ...element.styles,
        position: 'relative',
        width: '100%',
        height: '100%'
      }}
      onClick={onSelect}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '3rem',
          marginBottom: '60px',
          color: '#2c3e50'
        }}>
          {servicesElement.servicesContent.title}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px'
        }}>
          {servicesElement.servicesContent.services.map((service, index) => (
            <div
              key={index}
              style={{
                background: '#f8f9fa',
                padding: '40px',
                borderRadius: '15px',
                textAlign: 'center',
                border: '1px solid #e9ecef',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>
                {service.icon}
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                marginBottom: '15px',
                color: '#2c3e50'
              }}>
                {service.title}
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const StatsRenderer: React.FC<EnhancedRendererProps> = ({ element, isSelected, onSelect, onUpdate }) => {
  const statsElement = element as StatsElement;
  
  return (
    <section
      className={`stats-element ${isSelected ? 'selected' : ''}`}
      style={{
        ...element.styles,
        position: 'relative',
        width: '100%',
        height: '100%'
      }}
      onClick={onSelect}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          marginBottom: '40px',
          color: 'white'
        }}>
          {statsElement.statsContent.title}
        </h2>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center'
        }}>
          {statsElement.statsContent.stats.map((stat, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: '700',
                color: '#3498db',
                marginBottom: '10px'
              }}>
                {stat.number}
              </div>
              <div style={{
                fontSize: '1.2rem',
                opacity: 0.8
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const FooterRenderer: React.FC<EnhancedRendererProps> = ({ element, isSelected, onSelect, onUpdate }) => {
  const footerElement = element as FooterElement;
  
  return (
    <footer
      className={`footer-element ${isSelected ? 'selected' : ''}`}
      style={{
        ...element.styles,
        position: 'relative',
        width: '100%',
        height: '100%'
      }}
      onClick={onSelect}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        <h2 style={{
          fontSize: '2.5rem',
          marginBottom: '20px',
          color: 'white'
        }}>
          {footerElement.footerContent.title}
        </h2>
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '30px',
          opacity: 0.9
        }}>
          {footerElement.footerContent.description}
        </p>
        {footerElement.footerContent.ctaButton && (
          <button style={{
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '50px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}>
            {footerElement.footerContent.ctaButton.text}
          </button>
        )}
      </div>
    </footer>
  );
};



