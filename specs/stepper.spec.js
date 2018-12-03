var assert = require('assert');

// Set timeouts to be 30 secs for all kinds of operations
browser.timeouts({
  script: 30000,
  pageLoad: 30000,
  implicit: 30000,
});

// Webdriver's setValue function is not reliable at all, so write a reliable custom one
browser.addCommand('setValueSafe', (selector, text) => {
  const
    getActualText = elementId => browser
      .elementIdAttribute(elementId, 'value')
      .value.replace(/\W/gi, ''),
    setChar = (elementId, text, i) => {
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
  browser.elementIdClear(elementId);
  browser.waitUntil(() => getActualText(elementId) === '');
  for (let i = 0; i < text.length; i += 1) {
    setChar(elementId, text, i);
  }
});

const goToStepper2 = async ({ address, isEquityCalculator } = {}) => {
  address = address || '1126 Ebert Avenue, Austin';
  isEquityCalculator = isEquityCalculator == null ? false : isEquityCalculator;
  await browser.url(`https://qualify.easyknock.com/stepper1${isEquityCalculator ? '?goal=equity-calculator' : ''}`);
  await browser.waitForExist('#homeAddress');
  await browser.setValueSafe('#homeAddress', address);
  await browser.waitUntil(() => browser.getText('.dropdown-menu > button:first-child').includes(address));
  await browser.click('.dropdown-menu > button:first-child');
  await browser.pause(2000);
  await browser.click('.submit-button');
  await browser.waitUntil(() => browser.getUrl().includes('stepper2'));
  await browser.waitForVisible('.back-button');
};

const goToStepper4 = async ({
  address, homeValue = '300000', mortgageAmount = '200000', isEquityCalculator = false,
} = {}) => {
  await goToStepper2({ address, isEquityCalculator });
  await browser.setValueSafe('#homeValue', homeValue);
  await browser.setValueSafe('#mortgageAmount', mortgageAmount);
  await browser.pause(2000);
  await browser.click('.submit-button');
  await browser.waitUntil(() => browser.getUrl().includes('stepper3') || browser.getUrl().includes('stepper4'));
  await browser.waitForVisible('.back-button');
};

const goToStepper3 = () => goToStepper4({ isEquityCalculator: true });

const goToFinalState = async (params) => {
  await goToStepper4(params);
  await browser.setValueSafe('#firstName', 'Test');
  await browser.setValueSafe('#lastName', 'Test');
  await browser.setValueSafe('#emailAddress', 'test@gmail.com');
  while (await browser.getValue('#phoneNumber') !== '555-444-3322') {
    await browser.setValueSafe('#phoneNumber', '5554443322');
  }
  await browser.click('#agreeToTos');
  // Assert that it submits the form and goes to a final state
  await browser.pause(2000);
  await browser.click('.submit-button');
  await browser.waitUntil(() => browser.getUrl().includes('fit'));
};

describe('React stepper', () => {
  describe('step 1', () => {
    it('can search for an address and choose it', async () => {
      await browser.url('https://qualify.easyknock.com/stepper1');
      await browser.waitForExist('#homeAddress');
      // Wait until address shows up
      await browser.setValueSafe('#homeAddress', '123 broadway');
      await browser.waitUntil(() => browser.getText('.dropdown-menu > button:first-child').match(/broadway/i));
      // Select address
      await browser.click('.dropdown-menu > button:first-child');
      // Assert that it goes to the next page
      await browser.pause(2000);
      await browser.click('.submit-button');
      await browser.waitUntil(() => browser.getUrl().includes('stepper2'));
      await browser.waitForVisible('.back-button');
    });

    it('can enter their address if they can\'t find it', async () => {
      await browser.url('https://qualify.easyknock.com/stepper1');
      await browser.waitForExist('#homeAddress');
      // Enter non-existent address
      await browser.setValueSafe('#homeAddress', 'this is not an address');
      // Click on "I can't find my address"
      await browser.waitUntil(() => browser.getText('.dropdown-menu > button:first-child').match(/find my address/i));
      await browser.click('.dropdown-menu > button:first-child');
      // Wait until it goes to the next page
      await browser.waitUntil(() => browser.getUrl().includes('manual'));
      await browser.waitForVisible('.back-button');
      // Enter values
      await browser.setValueSafe('#street', '123 Street');
      await browser.setValueSafe('#city', 'New York');
      await browser.selectByValue('#state', 'NY');
      await browser.setValueSafe('#zipcode', '78705');
      // Assert that it goes to the next page
      await browser.pause(2000);
      await browser.click('.submit-button');
      await browser.waitUntil(() => browser.getUrl().includes('stepper2'));
      await browser.waitForVisible('.back-button');
    });
  });

  describe('step 2', () => {
    it('pre-populates value of home', async () => {
      await goToStepper2();
      // Assert that value of home is prepopulated
      assert((await browser.getValue('#homeValue')).length > 0);
    });

    it('value of home and mortgage balance can be entered', async () => {
      await goToStepper2();
      // Enter values
      await browser.setValueSafe('#homeValue', '300000');
      await browser.setValueSafe('#mortgageAmount', '200000');
      // Assert that it goes to the next page
      await browser.pause(2000);
      await browser.click('.submit-button');
      await browser.waitUntil(() => browser.getUrl().includes('stepper4'));
      await browser.waitForVisible('.back-button');
    });
  });

  describe('step 4', () => {
    it('submits the form', async () => {
      await goToStepper4();
      // Enter values
      await browser.setValueSafe('#firstName', 'Test');
      await browser.setValueSafe('#lastName', 'Test');
      await browser.setValueSafe('#emailAddress', 'test@gmail.com');
      while (await browser.getValue('#phoneNumber') !== '555-444-3322') {
        await browser.setValueSafe('#phoneNumber', '5554443322');
      }
      await browser.click('#agreeToTos');
      // Assert that it submits the form and goes to a final state
      await browser.pause(2000);
      await browser.click('.submit-button');
      await browser.waitUntil(() => browser.getUrl().includes('fit'));
    });

    it('goes to "/fit" with right inputs', async () => {
      await goToFinalState({ address: '1126 Ebert Avenue, Austin', homeValue: '300000', mortgageAmount: '75000' });
      assert((await browser.getUrl()).endsWith('/fit'));
    });

    it('goes to "/not-fit" with right inputs', async () => {
      await goToFinalState({ address: '1126 Ebert Avenue, Austin', homeValue: '249000', mortgageAmount: '200000' });
      assert((await browser.getUrl()).endsWith('/other-fit'));
    });

    it('goes to "/not-fit/Loan To Value" with right inputs', async () => {
      await goToFinalState({ address: '1126 Ebert Avenue, Austin', homeValue: '350000', mortgageAmount: '340000' });
      assert((await browser.getUrl()).endsWith('/not-fit/loan%20to%20value'));
    });

    it('goes to "/not-fit/State" with right inputs', async () => {
      await goToFinalState({ address: '315 S Cherry St, Richmond, VA', homeValue: '350000', mortgageAmount: '50000' });
      assert((await browser.getUrl()).endsWith('/not-fit/state'));
    });

    it('goes to "/not-fit/Home Value" with right inputs', async () => {
      await goToFinalState({ address: '1126 Ebert Avenue, Austin', homeValue: '50001', mortgageAmount: '0' });
      assert((await browser.getUrl()).endsWith('/not-fit/home%20value'));
    });
  });

  describe('step 3 for equity calculator', () => {
    it('can select an amount of cash on slider', async () => {
      await goToStepper3();
      // Move the slider
      await browser.waitForVisible('.input-range__slider');
      await browser.waitForVisible('#homeEquity');
      await browser.pause(5000);
      const firstValue = await browser.getValue('#homeEquity');
      await browser.dragAndDrop('.input-range__slider', '.back-button');
      const lastValue = await browser.getValue('#homeEquity');
      // Assert that slider actually changing the input value
      assert(firstValue !== lastValue);
    });
  });
});
