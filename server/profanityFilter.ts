import axios from 'axios';

const PROFANITY_API_URL = 'https://api.api-ninjas.com/v1/profanityfilter';
const API_KEY = 'eJMpDhjtu8sZfVFf/x3wXw==M2KQQfvPxtK2U5KI'; 

/**
 * Checks for profanity in the given text using the Profanity Filter API.
 *
 * @param text - The text to be checked for profanity.
 * @returns A promise resolving to whether the text contains profanity.
 */
export const checkProfanity = async (text: string): Promise<{ hasProfanity: boolean; censored: string }> => {
  try {
    const response = await axios.get(PROFANITY_API_URL, {
      params: { text },
      headers: { 'X-Api-Key': API_KEY },
    });

    if (response.data && response.data.has_profanity !== undefined) {
      return { hasProfanity: response.data.has_profanity, censored: response.data.censored };
    }

    throw new Error('Unexpected response from profanity filter API.');
  } catch (error) {
    throw new Error('Failed to validate content for profanity.');
  }
};
