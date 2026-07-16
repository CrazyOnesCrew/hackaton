import * as React from 'react';

import { cleanup, screen, setup } from '@/lib/test-utils';
import { SettingsScreen } from './settings-screen';

const mockMutate = jest.fn();

jest.mock('@/features/auth/api', () => ({
  useLogout: () => ({ mutate: mockMutate, isPending: false }),
}));

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('settingsScreen logout', () => {
  it('triggers the logout mutation when the logout item is pressed', async () => {
    const { user } = setup(<SettingsScreen />);

    await user.press(screen.getByTestId('logout-item'));

    expect(mockMutate).toHaveBeenCalledTimes(1);
  });
});
