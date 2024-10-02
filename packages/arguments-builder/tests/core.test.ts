import { ArgumentsBuilder } from '@iringo/arguments-builder';
import { testArgs } from './common';

describe('ArgumentsBuilder', () => {
  const builder = new ArgumentsBuilder({
    args: testArgs,
    boxJsConfig: { scope: '@iRingo.WeatherKit.Settings' },
  });

  describe('buildBoxJsSettings', () => {
    it('should generate correct BoxJs settings', () => {
      const result = builder.buildBoxJsSettings();
      expect(result).toEqual(
        expect.arrayContaining([
          {
            id: '@iRingo.WeatherKit.Settings.Switch',
            name: '总功能开关',
            val: true,
            type: 'boolean',
            desc: '是否启用此APP修改',
          },
          {
            id: '@iRingo.WeatherKit.Settings.NextHour.Provider',
            name: '[未来一小时降水强度]数据源',
            val: 'ColorfulClouds',
            type: 'selects',
            items: [
              {
                key: 'WeatherKit',
                label: 'WeatherKit (不进行替换)',
              },
              {
                key: 'ColorfulClouds',
                label: '彩云天气',
              },
              {
                key: 'QWeather',
                label: '和风天气',
              },
            ],
            desc: '始终会使用选定的数据源，填补无降水监测地区的数据。',
          },
          {
            id: '@iRingo.WeatherKit.Settings.AQI.Provider',
            name: '[空气质量]数据源',
            val: 'ColorfulClouds',
            type: 'selects',
            items: [
              {
                key: 'WeatherKit',
                label: 'WeatherKit (不进行替换)',
              },
              {
                key: 'ColorfulClouds',
                label: '彩云天气',
              },
              {
                key: 'QWeather',
                label: '和风天气',
              },
              {
                key: 'WAQI',
                label: 'The World Air Quality Project',
              },
            ],
            desc: '始终会使用选定的数据源，填补无空气质量监测地区的数据。',
          },
          {
            id: '@iRingo.WeatherKit.Settings.AQI.ReplaceProviders',
            name: '[空气质量]需要替换的供应商',
            val: [],
            type: 'checkboxes',
            desc: '选中的空气质量数据源会被替换。',
            items: [
              {
                key: 'QWeather',
                label: '和风天气',
              },
              {
                key: 'BreezoMeter',
                label: 'BreezoMeter',
              },
              {
                key: 'TWC',
                label: 'The Weather Channel',
              },
            ],
          },
          {
            id: '@iRingo.WeatherKit.Settings.AQI.Local.Scale',
            name: '[空气质量]本地替换算法',
            val: 'WAQI_InstantCast',
            type: 'selects',
            desc: '本地替换时使用的算法',
            items: [
              {
                key: 'NONE',
                label: 'None (不进行替换)',
              },
              {
                key: 'WAQI_InstantCast',
                label: 'WAQI InstantCast',
              },
            ],
          },
          {
            id: '@iRingo.WeatherKit.Settings.AQI.Local.ReplaceScales',
            name: '[空气质量]需要修改的标准',
            val: ['HJ6332012'],
            type: 'checkboxes',
            desc: '选中的空气质量标准会被替换。请注意各国监测的污染物种类可能有所不同，转换算法或API未必适合当地。',
            items: [
              {
                key: 'HJ6332012',
                label: '中国 (HJ 633—2012)',
              },
            ],
          },
          {
            id: '@iRingo.WeatherKit.Settings.AQI.Local.ConvertUnits',
            name: '[空气质量]转换污染物计量单位',
            val: false,
            type: 'boolean',
            desc: '（不推荐。不同单位互转可能会损失精度，导致数值偏大）将污染物数据替换为转换单位后的数据，方便对照转换后的标准。',
          },
          {
            id: '@iRingo.WeatherKit.Settings.API.ColorfulClouds.Token',
            name: '[API]彩云天气 API 令牌',
            val: '',
            type: 'text',
            placeholder: '123456789123456789abcdefghijklmnopqrstuv',
            desc: '彩云天气 API 令牌',
          },
          {
            id: '@iRingo.WeatherKit.Settings.API.QWeather.Host',
            name: '[API]和风天气 API 主机',
            val: 'devapi.qweather.com',
            type: 'selects',
            desc: '和风天气 API 使用的主机名',
            items: [
              {
                key: 'devapi.qweather.com',
                label: '免费订阅 (devapi.qweather.com)',
              },
              {
                key: 'api.qweather.com',
                label: '付费订阅 (api.qweather.com)',
              },
            ],
          },
          {
            id: '@iRingo.WeatherKit.Settings.API.QWeather.Token',
            name: '[API]和风天气 API 令牌',
            val: '',
            type: 'text',
            placeholder: '123456789123456789abcdefghijklmnopqrstuv',
            desc: '和风天气 API 令牌',
          },
          {
            id: '@iRingo.WeatherKit.Settings.API.WAQI.Token',
            name: '[API]WAQI API 令牌',
            val: '',
            type: 'text',
            placeholder: '123456789123456789abcdefghijklmnopqrstuv',
            desc: 'WAQI API 令牌，填写此字段将自动使用WAQI高级API',
          },
        ]),
      );
    });
  });

  describe('buildSurgeArguments', () => {
    it('should generate correct Surge arguments', () => {
      const result = builder.buildSurgeArguments();
      expect(result.argumentsText).not.toContain('Switch');
      expect(result.argumentsText).toContain('NextHour.Provider:ColorfulClouds');
      expect(result.argumentsDescription).toContain('[未来一小时降水强度]数据源');
      expect(result.argumentsDescription).toContain('[空气质量]数据源');
    });
  });

  describe('buildLoonArguments', () => {
    it('should generate correct Loon arguments', () => {
      const result = builder.buildLoonArguments();
      expect(result).not.toContain('Switch');
      expect(result).toContain('NextHour.Provider = select,"ColorfulClouds","WeatherKit","ColorfulClouds","QWeather"');
      expect(result).toContain(
        'AQI.Provider = select,"ColorfulClouds","WeatherKit","ColorfulClouds","QWeather","WAQI"',
      );
    });
  });

  describe('buildDtsArguments', () => {
    it('should generate correct DTS interface', () => {
      const result = builder.buildDtsArguments();
      expect(result).toContain('export interface Settings {');
      expect(result).toContain('Switch?: boolean;');
      expect(result).toContain('NextHour?: {');
      expect(result).toContain("Provider?: 'WeatherKit' | 'ColorfulClouds' | 'QWeather';");
      expect(result).toContain('AQI?: {');
      expect(result).toContain("Provider?: 'WeatherKit' | 'ColorfulClouds' | 'QWeather' | 'WAQI';");
      expect(result).toContain("ReplaceProviders?: ('QWeather' | 'BreezoMeter' | 'TWC')[];");
      expect(result).toContain('Local?: {');
      expect(result).toContain("Scale?: 'NONE' | 'WAQI_InstantCast';");
      expect(result).toContain("ReplaceScales?: ('HJ6332012')[];");
      expect(result).toContain('ConvertUnits?: boolean;');
      expect(result).toContain('API?: {');
      expect(result).toContain('ColorfulClouds?: {');
      expect(result).toContain('Token?: string;');
      expect(result).toContain('QWeather?: {');
      expect(result).toContain("Host?: 'devapi.qweather.com' | 'api.qweather.com';");
      expect(result).toContain('Token?: string;');
      expect(result).toContain('WAQI?: {');
      expect(result).toContain('Token?: string;');
      expect(result).toContain('@defaultValue true');
      expect(result).toContain('@defaultValue "ColorfulClouds"');
      expect(result).toContain('@defaultValue []');
      expect(result).toContain('@defaultValue "WAQI_InstantCast"');
      expect(result).toContain('@defaultValue ["HJ6332012"]');
      expect(result).toContain('@defaultValue false');
      expect(result).toContain('@defaultValue ""');
      expect(result).toContain('@defaultValue "devapi.qweather.com"');
    });
  });
});
