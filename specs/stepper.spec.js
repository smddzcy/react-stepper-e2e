var assert = require('assert');

// Set timeouts to be 30 secs for all kinds of operations
browser.timeouts({
  script: 30000,
  pageLoad: 30000,
  implicit: 30000,
});

// Webdriver's setValue function is not reliable at all, so write a reliable custom one
browser.addCommand('setValueSafe', (selector, text) => {
  const getActualText = (elementId) => {
    const val = browser.elementIdAttribute(elementId, 'value').value;
    return val ? val.replace(/\W/gi, '') : '';
  };
  const setChar = (elementId, text, i) => {
    const
      currentChar = text[i],
      expectedText = text.slice(0, i + 1).replace(/\W/gi, '');
    browser.elementIdValue(elementId, currentChar);
    try {
      browser
        .waitUntil(() => getActualText(elementId) === expectedText, 1000, 'failed', 16);
    } catch (e) {
      setChar(elementId, text, i);
    }
  };
  const elementId = browser.element(selector).value.ELEMENT;
  if (getActualText(elementId) === text.replace(/\W/gi, '')) return;

  browser.elementIdClear(elementId);
  browser.waitUntil(() => getActualText(elementId) === '');
  for (let i = 0; i < text.length; i += 1) {
    setChar(elementId, text, i);
  }
  browser.pause(4000);
});

const goToStepper2 = ({ address, isEquityCalculator } = {}) => {
  address = address || '1126 Ebert Avenue, Austin';
  isEquityCalculator = isEquityCalculator == null ? false : isEquityCalculator;
  browser.url(`https://qualify.easyknock.com/stepper1${isEquityCalculator ? '?goal=equity-calculator' : ''}`);
  browser.waitForExist('#homeAddress');
  browser.pause(2000);
  browser.setValueSafe('#homeAddress', address);
  browser.pause(2000);
  browser.waitUntil(() => browser.getText('.dropdown-menu > button:first-child').includes(address));
  browser.click('.dropdown-menu > button:first-child');
  browser.pause(2000);
  browser.click('.submit-button');
  browser.waitUntil(() => browser.getUrl().includes('stepper2'));
  browser.waitForVisible('.back-button');
};

const goToStepper4 = ({
  address, homeValue = '300000', mortgageAmount = '200000', isEquityCalculator = false,
} = {}) => {
  goToStepper2({ address, isEquityCalculator });
  browser.setValueSafe('#homeValue', homeValue);
  browser.setValueSafe('#mortgageAmount', mortgageAmount);
  browser.click('.submit-button');
  browser.waitUntil(() => browser.getUrl().includes('stepper3') || browser.getUrl().includes('stepper4'));
  browser.waitForVisible('.back-button');
};

const goToStepper3 = () => goToStepper4({ isEquityCalculator: true });

const goToFinalState = (params) => {
  goToStepper4(params);
  browser.setValueSafe('#firstName', 'Test');
  browser.setValueSafe('#lastName', 'Test');
  browser.setValueSafe('#emailAddress', 'test@gmail.com');
  browser.setValueSafe('#phoneNumber', '5554443322');
  browser.click('#agreeToTos');
  // Assert that it submits the form and goes to a final state
  browser.pause(2000);
  browser.click('.submit-button');
  browser.waitUntil(() => browser.getUrl().includes('fit'));
};

describe('React stepper', () => {
  // describe('step 1', () => {
  //   it('can search for an address and choose it', () => {
  //     browser.url('https://qualify.easyknock.com/stepper1');
  //     browser.waitForExist('#homeAddress');
  //     browser.pause(2000);
  //     // Wait until address shows up
  //     browser.setValueSafe('#homeAddress', '123 broadway');
  //     browser.waitUntil(() => browser.getText('.dropdown-menu > button:first-child').match(/broadway/i));
  //     // Select address
  //     browser.click('.dropdown-menu > button:first-child');
  //     // Assert that it goes to the next page
  //     browser.pause(2000);
  //     browser.click('.submit-button');
  //     browser.waitUntil(() => browser.getUrl().includes('stepper2'));
  //     browser.waitForVisible('.back-button');
  //   });

  //   it('can enter their address if they can\'t find it', () => {
  //     browser.url('https://qualify.easyknock.com/stepper1');
  //     browser.waitForExist('#homeAddress');
  //     browser.pause(2000);
  //     // Enter non-existent address
  //     browser.setValueSafe('#homeAddress', 'this is not an address');
  //     // Click on "I can't find my address"
  //     browser.waitUntil(() => browser.getText('.dropdown-menu > button:first-child').match(/find my address/i));
  //     browser.click('.dropdown-menu > button:first-child');
  //     // Wait until it goes to the next page
  //     browser.waitUntil(() => browser.getUrl().includes('manual'));
  //     browser.waitForVisible('.back-button');
  //     // Enter values
  //     browser.setValueSafe('#street', '123 Street');
  //     browser.setValueSafe('#city', 'New York');
  //     browser.selectByValue('#state', 'NY');
  //     browser.setValueSafe('#zipcode', '78705');
  //     // Assert that it goes to the next page
  //     browser.click('.submit-button');
  //     browser.waitUntil(() => browser.getUrl().includes('stepper2'));
  //     browser.waitForVisible('.back-button');
  //   });
  // });

  // describe('step 2', () => {
  //   it('pre-populates value of home', () => {
  //     goToStepper2();
  //     // Assert that value of home is prepopulated
  //     assert((browser.getValue('#homeValue')).length > 0);
  //   });

  //   it('value of home and mortgage balance can be entered', () => {
  //     goToStepper2();
  //     // Enter values
  //     browser.setValueSafe('#homeValue', '300000');
  //     browser.setValueSafe('#mortgageAmount', '200000');
  //     // Assert that it goes to the next page
  //     browser.click('.submit-button');
  //     browser.waitUntil(() => browser.getUrl().includes('stepper4'));
  //     browser.waitForVisible('.back-button');
  //   });
  // });

  describe('step 4', () => {
    it('submits the form', () => {
      goToStepper4();
      // Enter values
      browser.setValueSafe('#firstName', 'Test');
      browser.setValueSafe('#lastName', 'Test');
      browser.setValueSafe('#emailAddress', 'test@gmail.com');
      browser.setValueSafe('#phoneNumber', '5554443322');
      browser.click('#agreeToTos');
      // Assert that it submits the form and goes to a final state
      browser.pause(2000);
      browser.click('.submit-button');
      browser.waitUntil(() => browser.getUrl().includes('fit'));
    });

    it('goes to "/fit" with right inputs', () => {
      goToFinalState({ address: '1126 Ebert Avenue, Austin', homeValue: '300000', mortgageAmount: '75000' });
      assert((browser.getUrl()).endsWith('/fit'));
    });

    it('goes to "/not-fit" with right inputs', () => {
      goToFinalState({ address: '1126 Ebert Avenue, Austin', homeValue: '249000', mortgageAmount: '200000' });
      assert((browser.getUrl()).endsWith('/other-fit'));
    });

    it('goes to "/not-fit/Loan To Value" with right inputs', () => {
      goToFinalState({ address: '1126 Ebert Avenue, Austin', homeValue: '350000', mortgageAmount: '340000' });
      assert((browser.getUrl()).endsWith('/not-fit/loan%20to%20value'));
    });

    it('goes to "/not-fit/State" with right inputs', () => {
      goToFinalState({ address: '315 S Cherry St, Richmond, VA', homeValue: '350000', mortgageAmount: '50000' });
      assert((browser.getUrl()).endsWith('/not-fit/state'));
    });

    it('goes to "/not-fit/Home Value" with right inputs', () => {
      goToFinalState({ address: '1126 Ebert Avenue, Austin', homeValue: '50001', mortgageAmount: '0' });
      assert((browser.getUrl()).endsWith('/not-fit/home%20value'));
    });
  });

  describe('step 3 for equity calculator', () => {
    it('can select an amount of cash on slider', () => {
      goToStepper3();
      // Move the slider
      browser.waitForVisible('.input-range__slider');
      browser.waitForVisible('#homeEquity');
      browser.pause(5000);
      const firstValue = browser.getValue('#homeEquity');
      browser.dragAndDrop('.input-range__slider', '.back-button');
      const lastValue = browser.getValue('#homeEquity');
      // Assert that slider actually changing the input value
      assert(firstValue !== lastValue);
    });
  });
});
