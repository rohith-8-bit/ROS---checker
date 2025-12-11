import { SimulationResult } from "../types";

export const executeRemoteSimulation = async (
  bridgeUrl: string, 
  code: string, 
  detectedNodes: string[]
): Promise<SimulationResult> => {
  try {
    const response = await fetch(bridgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        nodes: detectedNodes,
        parameters: {
          robot: 'ur5',
          scene: 'table_pick_place'
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Bridge Server Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validate response shape roughly matches SimulationResult
    if (typeof data.success !== 'boolean' || !Array.isArray(data.logs)) {
      throw new Error("Invalid response format from Bridge Server");
    }

    return data as SimulationResult;

  } catch (error) {
    console.error("Bridge Execution Failed:", error);
    return {
      success: false,
      logs: [
        { 
          timestamp: new Date().toISOString(), 
          level: "ERROR", 
          node: "BridgeClient", 
          message: error instanceof Error ? error.message : "Unknown connection error" 
        },
        { 
          timestamp: new Date().toISOString(), 
          level: "INFO", 
          node: "BridgeClient", 
          message: "Ensure your local Gazebo bridge server is running and CORS is enabled." 
        }
      ],
      frames: []
    };
  }
};
