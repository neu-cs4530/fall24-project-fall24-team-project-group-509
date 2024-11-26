import axios from 'axios';
import { checkProfanity } from '../profanityFilter';

jest.mock('axios');

describe('Profanity Check', () => {
  describe('checkProfanity', () => {
    test('checkProfanity returns hasProfanity true and censored text when profanity is detected', async () => {
      const responseData = {
        data: {
          has_profanity: true,
          censored: '**** you',
        },
      };
      (axios.get as jest.Mock).mockResolvedValue(responseData);

      const result = await checkProfanity('damn you');

      expect(result.hasProfanity).toBe(true);
      expect(result.censored).toEqual('**** you');
    });

    test('checkProfanity returns hasProfanity false and original text when no profanity is detected', async () => {
      const responseData = {
        data: {
          has_profanity: false,
          censored: 'hello there',
        },
      };
      (axios.get as jest.Mock).mockResolvedValue(responseData);

      const result = await checkProfanity('hello there');

      expect(result.hasProfanity).toBe(false);
      expect(result.censored).toEqual('hello there');
    });

    test('checkProfanity throws an error if axios call fails', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

      await expect(checkProfanity('some text')).rejects.toThrow(
        'Failed to validate content for profanity.',
      );
    });

    test('throws an error if response does not contain has_profanity key', async () => {
      const malformedResponseData = {
        data: {
          unexpected_key: 'unexpected_value',
        },
      };
      (axios.get as jest.Mock).mockResolvedValue(malformedResponseData);

      await expect(checkProfanity('test text')).rejects.toThrow(
        'Unexpected response from profanity filter API.',
      );
    });
  });
});
