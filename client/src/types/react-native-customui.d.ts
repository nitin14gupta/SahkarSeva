declare module 'react-native-customui' {
  interface VpaValidationResult {
    customer_name?: string
    name?: string
    [key: string]: unknown
  }

  export default class Razorpay {
    static initRazorpay(key: string): Promise<void>
    static isValidVpa(vpaAddress: string): Promise<VpaValidationResult>
  }
}
