import { AnalysisReport } from './types';

export const MOCK_REPORT: AnalysisReport = {
  isValid: true,
  score: 85,
  issues: [
    { severity: 'warning' as any, message: 'Loop rate might be too low for real-time control.' },
    { severity: 'info' as any, message: 'Detected publisher on /joint_states' }
  ],
  detectedNodes: ['arm_controller'],
  detectedTopics: ['/joint_states', '/cmd_vel'],
  safetyCheck: {
    safe: true,
    details: 'Velocity limits appear respected.'
  }
};

export const INITIAL_CODE_PYTHON = `#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class SimplePublisher(Node):
    def __init__(self):
        super().__init__('simple_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = 'Hello World: %d' % self.i
        self.publisher_.publish(msg)
        self.get_logger().info('Publishing: "%s"' % msg.data)
        self.i += 1

def main(args=None):
    rclpy.init(args=args)
    minimal_publisher = SimplePublisher()
    rclpy.spin(minimal_publisher)
    minimal_publisher.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
`;
