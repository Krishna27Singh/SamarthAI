#include <iostream>
#include <vector>
#include <cmath>
#include <string>
#include <sstream>
#include <algorithm>
#include <random>

using namespace std;

// --- 1. Data Structures ---
struct Node {
    string id;
    double lat;
    double lng;
    double urgency;
    double anomaly;
};

// --- 2. Math & Haversine Formula (Distance in KM) ---
const double R = 6371.0; // Earth's radius in km
const double TO_RAD = M_PI / 180.0;

double haversine(double lat1, double lon1, double lat2, double lon2) {
    double dLat = (lat2 - lat1) * TO_RAD;
    double dLon = (lon2 - lon1) * TO_RAD;
    lat1 = lat1 * TO_RAD;
    lat2 = lat2 * TO_RAD;

    double a = pow(sin(dLat / 2), 2) + pow(sin(dLon / 2), 2) * cos(lat1) * cos(lat2);
    double c = 2 * asin(sqrt(a));
    return R * c;
}

// --- 3. The Custom Fitness Function (The "Secret Sauce") ---
// This calculates the total cost of a specific route sequence.
double calculateCost(const vector<int>& route, const vector<Node>& nodes) {
    double total_distance = 0;
    double penalty_score = 0;
    int num_stops = route.size() - 1; // excluding the final return to hub

    for (size_t i = 0; i < route.size() - 1; i++) {
        int curr = route[i];
        int next = route[i + 1];
        
        // 1. Add physical distance (Logistics)
        total_distance += haversine(nodes[curr].lat, nodes[curr].lng, nodes[next].lat, nodes[next].lng);

        // 2. Add Multi-Objective Penalties (Only for camps, not the hub which is index 0)
        if (next != 0) {
            int arrival_step = i + 1; // 1st stop, 2nd stop, etc.
            
            // URGENCY PENALTY: High urgency camps must be visited early.
            // If visited late (high arrival_step), penalty explodes.
            double urgency_weight = 2.5;
            penalty_score += (arrival_step * nodes[next].urgency * urgency_weight);

            // ANOMALY PENALTY: High risk camps should be pushed to the end of the route.
            // If visited early, penalty explodes.
            double anomaly_weight = 1.5;
            penalty_score += ((num_stops - arrival_step) * nodes[next].anomaly * anomaly_weight);
        }
    }
    return total_distance + penalty_score;
}

// --- 4. Input Parsing ---
// Expects: "Hub,28.6,77.2|C1,28.7,77.3,95,0|C2,28.5,77.1,10,80"
vector<Node> parseInput(const string& input) {
    vector<Node> nodes;
    stringstream ss(input);
    string token;

    while (getline(ss, token, '|')) {
        stringstream nodeStream(token);
        string id, latStr, lngStr, urgStr, anoStr;
        
        getline(nodeStream, id, ',');
        getline(nodeStream, latStr, ',');
        getline(nodeStream, lngStr, ',');
        
        Node n;
        n.id = id;
        n.lat = stod(latStr);
        n.lng = stod(lngStr);
        
        // Hub only has 3 parts. Camps have 5.
        if (getline(nodeStream, urgStr, ',')) {
            n.urgency = stod(urgStr);
            getline(nodeStream, anoStr, ',');
            n.anomaly = stod(anoStr);
        } else {
            n.urgency = 0;
            n.anomaly = 0;
        }
        nodes.push_back(n);
    }
    return nodes;
}

// --- 5. Main Execution: Simulated Annealing ---
int main(int argc, char* argv[]) {
    if (argc < 2) {
        cerr << "Error: No data provided." << endl;
        return 1;
    }

    string inputData = argv[1];
    vector<Node> nodes = parseInput(inputData);
    int n = nodes.size();

    // Initial Route: [0, 1, 2, ..., N-1, 0] (Start at hub, visit camps, return to hub)
    vector<int> current_route;
    current_route.push_back(0); // Hub
    for (int i = 1; i < n; i++) current_route.push_back(i);
    current_route.push_back(0); // Hub

    double current_cost = calculateCost(current_route, nodes);
    
    // Track the absolute best route found
    vector<int> best_route = current_route;
    double best_cost = current_cost;

    // Simulated Annealing Parameters
    double temperature = 10000.0;
    double cooling_rate = 0.999;
    double absolute_temp = 0.00001;

    random_device rd;
    mt19937 gen(rd());
    uniform_real_distribution<> dis(0.0, 1.0);

    // The Cooling Loop
    while (temperature > absolute_temp) {
        vector<int> new_route = current_route;
        
        // Swap two random camps (don't touch index 0 or index N, which are the Hub)
        if (n > 2) { // Need at least 2 camps to swap
            uniform_int_distribution<> swap_dis(1, n - 1);
            int idx1 = swap_dis(gen);
            int idx2 = swap_dis(gen);
            while (idx1 == idx2) idx2 = swap_dis(gen);
            
            swap(new_route[idx1], new_route[idx2]);
        }

        double new_cost = calculateCost(new_route, nodes);

        // Acceptance Probability
        if (new_cost < current_cost || exp((current_cost - new_cost) / temperature) > dis(gen)) {
            current_route = new_route;
            current_cost = new_cost;
            
            if (current_cost < best_cost) {
                best_route = current_route;
                best_cost = current_cost;
            }
        }
        temperature *= cooling_rate;
    }

    // --- 6. Output Results as valid JSON ---
    cout << "{";
    cout << "\"best_score\": " << best_cost << ", ";
    cout << "\"optimal_route\": [";
    for (size_t i = 0; i < best_route.size(); i++) {
        cout << "\"" << nodes[best_route[i]].id << "\"";
        if (i < best_route.size() - 1) cout << ", ";
    }
    cout << "]}";

    return 0;
}