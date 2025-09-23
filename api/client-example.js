// Example client code for your friend to fetch data from KisanSetu API
// This can be used in any JavaScript/Node.js application

const API_BASE_URL = 'http://localhost:3000/api';

class KisanSetuAPI {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Helper method to make API calls
  async makeRequest(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error.message);
      throw error;
    }
  }

  // Get all users
  async getAllUsers() {
    return await this.makeRequest('/users');
  }

  // Get user by ID
  async getUserById(id) {
    return await this.makeRequest(`/users/${id}`);
  }

  // Search users by phone
  async searchByPhone(phone) {
    return await this.makeRequest(`/users/search/phone/${phone}`);
  }

  // Search users by name
  async searchByName(name) {
    return await this.makeRequest(`/users/search/name/${encodeURIComponent(name)}`);
  }

  // Get nearby users
  async getNearbyUsers(latitude, longitude, radius = 10) {
    return await this.makeRequest(`/users/location/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
  }

  // Get statistics
  async getStats() {
    return await this.makeRequest('/stats');
  }

  // Check API health
  async checkHealth() {
    return await this.makeRequest('/health');
  }
}

// Usage examples
async function examples() {
  const api = new KisanSetuAPI();

  try {
    // 1. Check if API is running
    console.log('🔍 Checking API health...');
    const health = await api.checkHealth();
    console.log('✅ API Status:', health.message);

    // 2. Get all users
    console.log('\n📋 Fetching all users...');
    const allUsers = await api.getAllUsers();
    console.log(`✅ Found ${allUsers.count} users`);
    console.log('First user:', allUsers.data[0]);

    // 3. Search by phone
    console.log('\n📱 Searching by phone...');
    const phoneResults = await api.searchByPhone('+1234567890');
    console.log(`✅ Found ${phoneResults.count} users with that phone`);

    // 4. Search by name
    console.log('\n👤 Searching by name...');
    const nameResults = await api.searchByName('John');
    console.log(`✅ Found ${nameResults.count} users with name containing "John"`);

    // 5. Get nearby users (example: Delhi coordinates)
    console.log('\n📍 Finding nearby users...');
    const nearbyUsers = await api.getNearbyUsers(28.6139, 77.2090, 5);
    console.log(`✅ Found ${nearbyUsers.count} users within 5km`);

    // 6. Get statistics
    console.log('\n📊 Getting statistics...');
    const stats = await api.getStats();
    console.log('✅ Stats:', stats.stats);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KisanSetuAPI;
}

// Run examples if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  examples();
}
