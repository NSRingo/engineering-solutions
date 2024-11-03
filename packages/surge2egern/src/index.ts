import ora from 'ora';
import puppeteer, { type Page, type Browser, type ElementHandle } from 'puppeteer';

export class Surge2Egern {
  #browser!: Browser;

  #page!: Page;

  #initPromise: Promise<void>;

  constructor() {
    this.#initPromise = this.#init();
  }

  async #init() {
    this.#browser = await puppeteer.launch();
    this.#page = await this.#browser.newPage();

    await this.#page.goto('https://gen.egernapp.com/');
  }

  async #findElement(title: string) {
    await this.#initPromise;

    const handle = await this.#page.evaluateHandle(
      (option) => {
        const titleEl = Array.from(document.querySelectorAll('h1')).find((el) => el.textContent === option.title);
        if (!titleEl) {
          return null;
        }
        const result = titleEl.closest('div')?.querySelectorAll('.relative textarea');
        if (!result) {
          return null;
        }
        const [input, output] = Array.from(result);
        return { input, output };
      },
      {
        title,
      },
    );

    const inputHandle = await handle.getProperty('input');
    const outputHandle = await handle.getProperty('output');

    const inputElement = inputHandle.asElement() as ElementHandle<HTMLInputElement>;
    const outputElement = outputHandle.asElement() as ElementHandle<HTMLInputElement>;
    if (!inputElement || !outputElement) {
      throw new Error('Element not found');
    }
    return { inputElement, outputElement };
  }

  async #transform(title: string, text: string) {
    const spinner = ora(`正在${title}`).start();
    try {
      const { inputElement, outputElement } = await this.#findElement(title);

      // 清空输入框的内容
      await this.#page.evaluate((input) => {
        input.value = '';
      }, inputElement);

      // 输入新的内容
      await inputElement.type(text);

      await new Promise((resolve) => setTimeout(resolve, 500));

      // 获取输出框的值
      const outputValue = await this.#page.evaluate((output) => {
        return output.value;
      }, outputElement);

      await this.#browser.close();
      spinner.succeed(`${title}成功`);

      return outputValue;
    } catch (error) {
      await this.#browser.close();
      spinner.fail(`${title}失败`);
      throw error;
    }
  }

  transformModule(module: string) {
    return this.#transform('模块配置转换', module);
  }

  async transformRules(rules: string) {
    return this.#transform('规则集合转换', rules);
  }
}
