import fetch from 'node-fetch';
import { RequestInit, Response } from 'node-fetch';
import { config } from 'dotenv';

config({ path: "./config/.env" });
// Example usage:
/*
import { WeightsApi } from './weights-api';
const api = new WeightsApi('your-api-key');

// Get health status
api.getHealthData()
    .then(data => console.log('Health:', data))
    .catch(err => console.error(err));

// Search for Loras
api.searchLoras({ query: 'anime' })
    .then(results => console.log('Loras:', results))
    .catch(err => console.error(err));

// Generate an image
api.generateImage({ query: 'beautiful landscape', loraName: null })
    .then(result => console.log('Image:', result))
    .catch(err => console.error(err));

// Generate progressive image with status updates
api.generateProgressiveImage(
    { query: 'sunset beach', loraName: null },
    (status) => console.log('Status:', status)
)
    .then(result => console.log('Final result:', result))
    .catch(err => console.error(err));
*/
export class WeightsApi {
    constructor(apiKey: string | null) {
        this.apiKey = apiKey;
    }
    private apiKey: string | null = null;
    private endpoint: string = process.env.WEIGHTS_UNOFFICIAL_ENDPOINT || '';

    /**
     * Makes an HTTP request to the API endpoint
     * @param path - The API endpoint path
     * @param method - The HTTP method (default: 'GET')
     * @param body - The request body (optional)
     * @returns Promise<Response>
     */
    async apiCall(path: string, method: string = 'GET', body: any = null) {
        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': `${this.apiKey}`,
            },
        };
        let url = this.endpoint + path;
        if (method === 'GET' && body) {
            const params = new URLSearchParams();
            for (const key in body) {
                if (body.hasOwnProperty(key)) {
                    params.append(key, body[key]);
                }
            }
            url += '?' + params.toString();
        } else if (body) {
            options.body = JSON.stringify(body);
        }
        return fetch(url, options);
    }

    /**
     * Retrieves health status of the API
     * @returns Promise with health data
     */
    getHealthData = async () => {
        await this.apiCall('/health', 'GET')
        .then(response => response.json())
        .then((response: any) => {
            if (response.ok) {
                return response;
            } else {
                throw new Error(`Error: ${response.status} - ${response}`);
            }
        })
    }

    /**
     * Gets the status of a specific image
     * @param params - Object containing imageId
     * @returns Promise with status information
     */
    getStatus = async (params: {imageId: string}) => {
        try {
            await this.getHealthData();
        }
        catch (error) { 
            throw new Error(`Weights API Error: The API is not reachable. Please check your connection or the API status.`);
        }

        return this.apiCall('/status/' + params.imageId, 'GET')
        .then(response => response.json())
        .then((response: any) => {
            if (response.ok) {
                return response;
            } else {
                throw new Error(`Error: ${response.status} - ${response}`);
            }
        });
    }

    /**
     * Retrieves quota information
     * @returns Promise with quota data
     */
    getQuota = async () => {
        try {
            await this.getHealthData();
        }
        catch (error) { 
            throw new Error(`Weights API Error: The API is not reachable. Please check your connection or the API status.`);
        }

        return this.apiCall('/quota', 'GET')
        .then(response => response.text())
        .then((response: any) => {
            if (response.ok) {
                return response;
            } else {
                throw new Error(`Error: ${response.status} - ${response}`);
            }
        });
    }

    /**
     * Searches for Lora models
     * @param params - Object containing search query
     * @returns Promise with search results
     */
    searchLoras = async (params: {query: string}) => {
        try {
            await this.getHealthData();
        }
        catch (error) { 
            throw new Error(`Weights API Error: The API is not reachable. Please check your connection or the API status.`);
        }

        return this.apiCall('/search-loras', 'GET', params)
        .then(response => response.json())
        .then((response: any) => {
            if (response.ok) {
                return response;
            } else {
                throw new Error(`Error: ${response.status} - ${response}`);
            }
        });
    }

    /**
     * Generates an image based on parameters
     * @param imageId - The ID for the generated image
     * @param params - Object containing query and optional loraName
     * @returns Promise with generation results
     */
    generateImage = async (params: {query: string, loraName: string | null}) => {
        try {
            await this.getHealthData();
        }
        catch (error) { 
            throw new Error(`Weights API Error: The API is not reachable. Please check your connection or the API status.`);
        }

        return this.apiCall('/generateImage', 'GET', params)
        .then(response => response.json())
        .then((response: any) => {
            if (response.ok) {
                return response;
            } else {
                throw new Error(`Error: ${response.status} - ${response}`);
            }
        });
    }

    /**
     * Generates a progressive image based on parameters
     * @param params - Object containing query and optional loraName
     * @param callback - Function to call with status updates
     * @returns Promise with generation results
     */
    generateProgressiveImage = async (params: {query: string, loraName: string | null}, callback: Function = (status: string)=>{}) => {
        try {
            await this.getHealthData();
        }
        catch (error) { 
            throw new Error(`Weights API Error: The API is not reachable. Please check your connection or the API status.`);
        }

        const { imageId } = await this.generateImage(params);
        const statusResponse = await this.getStatus({ imageId });
        let { status } = statusResponse;
        let oldModifiedDate = null;
        while(status !== 'COMPLETED') {
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100 milliseconds
            const statusResponse = await this.getStatus({ imageId });
            let { status } = statusResponse;
            let lastModifiedDate = statusResponse.lastModifiedDate || null;
            if(oldModifiedDate !== lastModifiedDate) {
                oldModifiedDate = lastModifiedDate;
                callback(status);
            }
        }
        return statusResponse;
    }
}