// navigation/types.ts
import { NavigatorScreenParams } from '@react-navigation/native';

export type SecurityStackParamList = {
  security_home: undefined;
  visit_details: {
    code: string;
    visitor: {
      id: number;
      visitor_name: string;
      visitor_phone: string;
      house_address: string;
      start_time: string;
      end_time: string;
      time_left: string;
      status: string;
      approval_status: string;
      comment?: string | null;
      departure_confirmed?: boolean;
    };
  };
};

export type RootStackParamList = {
  // Intro/Auth. This app is security-agent-only, so there is no role to pick
  // and no resident/admin auth route - residents ship as their own app and
  // facility managers use the web admin.
  introslider: undefined;
  security_auth: undefined;

  SecurityApp: NavigatorScreenParams<SecurityStackParamList>;
};
