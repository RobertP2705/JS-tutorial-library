function initGuidanceSystem(steps) {
  let currentLanguage = 'eng';
  let currentStep = 0;
  let isHelpMode = false;
  let isTutorialMode = false;

  const languages = {
    eng: {
      tutorialStart: "Start Tutorial",
      tutorialNext: "Next",
      tutorialPrev: "Previous",
      tutorialFinish: "Finish",
      helpToggle: "Help Mode",
      helpExit: "Exit Help"
    },
    esp: {
      tutorialStart: "Iniciar Tutorial",
      tutorialNext: "Siguiente",
      tutorialPrev: "Anterior",
      tutorialFinish: "Terminar",
      helpToggle: "Modo de Ayuda",
      helpExit: "Salir Ayuda"
    }
  };

  const tutorialContainer = document.createElement('div');
  const helpContainer = document.createElement('div');
  const buttonContainer = document.createElement('div');

  tutorialContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;S
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9999;
    display: none;
  `;

  helpContainer.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9999;
    display: none;
  `;

  buttonContainer.style.cssText = `
    position: fixed;
    bottom: 2vh;
    right: 2vw;
    display: flex;
    gap: 1vw;
    z-index: 9999;
  `;

  const helpButton = document.createElement('button');
  const tutorialButton = document.createElement('button');

  helpButton.style.cssText = tutorialButton.style.cssText = `
    padding: 1vh 2vw;
    color: white;
    border: none;
    border-radius: 0.5vh;
    cursor: pointer;
    font-size: 1.5vh;
  `;

  helpButton.style.backgroundColor = '#28a745';
  tutorialButton.style.backgroundColor = '#007bff';

  const tutorialOverlay = document.createElement('div');
  const highlightContainer = document.createElement('div');
  const textDisplay = document.createElement('div');
  const navButtons = document.createElement('div');

  tutorialOverlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    pointer-events: auto;
  `;

  textDisplay.style.cssText = `
    position: absolute;
    background: white;
    padding: 1.5vh 2vw;
    border-radius: 0.8vh;
    box-shadow: 0 0.4vh 1vh rgba(0, 0, 0, 0.2);
    max-width: 30vw;
    font-size: 2.5vh;
    line-height: 2.2vh;
    z-index: 10000;
  `;

  navButtons.style.cssText = `
    position: fixed;
    bottom: 2vh;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 1vw;
    pointer-events: auto;
  `;

  const helpOverlay = document.createElement('div');
  const helpTooltip = document.createElement('div');

  helpOverlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.2);
    pointer-events: none;
  `;

  helpTooltip.style.cssText = `
    position: absolute;
    background: white;
    padding: 1.5vh 2vw;
    border-radius: 0.8vh;
    box-shadow: 0 0.4vh 1vh rgba(0, 0, 0, 0.2);
    max-width: 30vw;
    font-size: 2.5vh;
    line-height: 2.2vh;
    display: none;
    pointer-events: none;
    z-index: 10000;
  `;

  // assemble containers
  document.body.appendChild(tutorialContainer);
  document.body.appendChild(helpContainer);
  document.body.appendChild(buttonContainer);

  tutorialContainer.appendChild(tutorialOverlay);
  tutorialContainer.appendChild(highlightContainer);
  tutorialContainer.appendChild(textDisplay);
  tutorialContainer.appendChild(navButtons);

  helpContainer.appendChild(helpOverlay);
  helpContainer.appendChild(helpTooltip);

  buttonContainer.appendChild(helpButton);
  buttonContainer.appendChild(tutorialButton);

  ['previous', 'next'].forEach(type => {
    const button = document.createElement('button');
    button.style.cssText = `
      padding: 1vh 2vw;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 0.5vh;
      cursor: pointer;
      font-size: 1.5vh;
    `;
    button.onclick = () => navigate(type === 'next' ? 1 : -1);
    navButtons.appendChild(button);
  });

  function createHighlight(element) {
    const rect = element.getBoundingClientRect();
    const highlight = document.createElement('div');
    highlight.style.cssText = `
      position: absolute;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      background: transparent;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
      border: 2px solid #007bff;
      border-radius: 4px;
      pointer-events: auto;
    `;
    return highlight;
  }

  function showStep(step) {
    if (step < 0 || step >= steps.length) return;
    currentStep = step;
    
    highlightContainer.innerHTML = '';
    
    const { element, position } = steps[step];
    const text = currentLanguage === 'esp' && steps[step].esptext ? 
      steps[step].esptext : steps[step].text;
    
    const targetElement = typeof element === 'string' ? 
      document.querySelector(element) : element;
    
    if (!targetElement) {
      console.warn(`Element not found for step ${step}`);
      navigate(1);
      return;
    }

    const highlight = createHighlight(targetElement);
    highlightContainer.appendChild(highlight);
    
    positionTooltip(targetElement, position, text);
    updateNavButtons();
  }

  function positionTooltip(element, position, content) {
    const rect = element.getBoundingClientRect();
    textDisplay.textContent = content;
    
    const offset = 20;
    let left, top;
    
    switch (position) {
      case 'top':
        left = rect.left + (rect.width - textDisplay.offsetWidth) / 2;
        top = rect.top - textDisplay.offsetHeight - offset;
        break;
      case 'bottom':
        left = rect.left + (rect.width - textDisplay.offsetWidth) / 2;
        top = rect.bottom + offset;
        break;
      case 'left':
        left = rect.left - textDisplay.offsetWidth - offset;
        top = rect.top + (rect.height - textDisplay.offsetHeight) / 2;
        break;
      case 'right':
        left = rect.right + offset;
        top = rect.top + (rect.height - textDisplay.offsetHeight) / 2;
        break;
    }

    const padding = 10;
    if (left < padding) left = padding;
    if (left + textDisplay.offsetWidth > window.innerWidth - padding) {
      left = window.innerWidth - textDisplay.offsetWidth - padding;
    }
    if (top < padding) top = padding;
    if (top + textDisplay.offsetHeight > window.innerHeight - padding) {
      top = window.innerHeight - textDisplay.offsetHeight - padding;
    }

    textDisplay.style.left = `${left}px`;
    textDisplay.style.top = `${top}px`;
  }

  function highlightHelpElements() {
    steps.forEach(({ element }) => {
      const el = document.querySelector(element);
      if (el) {
        const rect = el.getBoundingClientRect();
        const highlight = document.createElement('div');
        highlight.style.cssText = `
          position: absolute;
          top: ${rect.top}px;
          left: ${rect.left}px;
          width: ${rect.width}px;
          height: ${rect.height}px;
          border: 2px solid #28a745;
          border-radius: 4px;
          pointer-events: auto;
          cursor: help;
        `;
        
        highlight.addEventListener('mouseenter', () => showHelpTooltip(el, rect));
        highlight.addEventListener('mouseleave', () => helpTooltip.style.display = 'none');
        
        helpContainer.appendChild(highlight);
      }
    });
  }

  function showHelpTooltip(element, rect) {
    const elementData = steps.find(e => document.querySelector(e.element) === element);
    if (!elementData) return;

    const text = currentLanguage === 'esp' && elementData.esptext ? 
      elementData.esptext : elementData.text;
    
    helpTooltip.textContent = text;
    helpTooltip.style.display = 'block';

    const padding = 10;
    let left = rect.left + (rect.width - helpTooltip.offsetWidth) / 2;
    let top = rect.bottom + padding;

    if (left < padding) left = padding;
    if (left + helpTooltip.offsetWidth > window.innerWidth - padding) {
      left = window.innerWidth - helpTooltip.offsetWidth - padding;
    }
    if (top + helpTooltip.offsetHeight > window.innerHeight - padding) {
      top = rect.top - helpTooltip.offsetHeight - padding;
    }

    helpTooltip.style.left = `${left}px`;
    helpTooltip.style.top = `${top}px`;
  }

  function toggleHelpMode() {
    if (isTutorialMode) return;
    isHelpMode = !isHelpMode;
    helpContainer.style.display = isHelpMode ? 'block' : 'none';
    helpButton.textContent = languages[currentLanguage][isHelpMode ? 'helpExit' : 'helpToggle'];
    
    if (isHelpMode) {
      helpContainer.innerHTML = '';
      helpContainer.appendChild(helpOverlay);
      helpContainer.appendChild(helpTooltip);
      highlightHelpElements();
    }
  }

  function startTutorial() {
    if (isHelpMode) {
      toggleHelpMode();
    }
    isTutorialMode = true;
    tutorialContainer.style.display = 'block';
    buttonContainer.style.display = 'none';
    showStep(0);
  }

  function endTutorial() {
    isTutorialMode = false;
    tutorialContainer.style.display = 'none';
    buttonContainer.style.display = 'flex';
    currentStep = 0;
  }

  function navigate(direction) {
  let nextStep = currentStep + direction;
  while (nextStep >= 0 && nextStep < steps.length) {
    const { element } = steps[nextStep];
    const targetElement = typeof element === 'string' ? 
      document.querySelector(element) : element;
    
    if (isElementVisible(targetElement)) {
      showStep(nextStep);
      return;
    }
    nextStep += direction;
  }
  
  if (nextStep >= steps.length) {
    endTutorial();
  }
}

  function updateNavButtons() {
    const [prevBtn, nextBtn] = navButtons.children;
    prevBtn.disabled = currentStep === 0;
    nextBtn.textContent = currentStep === steps.length - 1 ? 
      languages[currentLanguage].tutorialFinish : 
      languages[currentLanguage].tutorialNext;
    prevBtn.textContent = languages[currentLanguage].tutorialPrev;
  }
  function isElementVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }
  function changeLanguage(lang) {
    if (languages[lang]) {
      currentLanguage = lang;
      helpButton.textContent = languages[currentLanguage][isHelpMode ? 'helpExit' : 'helpToggle'];
      tutorialButton.textContent = languages[currentLanguage].tutorialStart;
      if (isTutorialMode) {
        updateNavButtons();
        showStep(currentStep);
      }
      if (isHelpMode) {
        helpContainer.innerHTML = '';
        helpContainer.appendChild(helpOverlay);
        helpContainer.appendChild(helpTooltip);
        highlightHelpElements();
      }
    }
  }

  helpButton.addEventListener('click', toggleHelpMode);
  tutorialButton.addEventListener('click', startTutorial);
  window.addEventListener('resize', () => {
    if (isHelpMode) {
      helpContainer.innerHTML = '';
      helpContainer.appendChild(helpOverlay);
      helpContainer.appendChild(helpTooltip);
      highlightHelpElements();
    }
    if (isTutorialMode) {
      showStep(currentStep);
    }
  });
  changeLanguage('eng');

  return { 
    changeLanguage,
    startTutorial,
    toggleHelpMode
  };
}
