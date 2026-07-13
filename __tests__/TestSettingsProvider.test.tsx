import React from 'react';
import { render, act } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { TestSettingsProvider, useTestSettings } from '../src/components/TestSettingsProvider';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

const TestComponent = () => {
  const { settings, updateSetting } = useTestSettings();
  return (
    <div>
      <span data-testid="fontSize">{settings.fontSize}</span>
      <span data-testid="showTimer">{settings.showTimer ? 'true' : 'false'}</span>
      <button onClick={() => updateSetting('fontSize', 18)}>Change Font</button>
      <button onClick={() => updateSetting('showTimer', false)}>Hide Timer</button>
    </div>
  );
};

describe('TestSettingsProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('provides default settings', () => {
    render(
      <TestSettingsProvider>
        <TestComponent />
      </TestSettingsProvider>
    );

    expect(screen.getByTestId('fontSize')).toHaveTextContent('14');
    expect(screen.getByTestId('showTimer')).toHaveTextContent('true');
  });

  test('updates settings and persists to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <TestSettingsProvider>
        <TestComponent />
      </TestSettingsProvider>
    );

    await user.click(screen.getByText('Change Font'));
    expect(screen.getByTestId('fontSize')).toHaveTextContent('18');
    expect(JSON.parse(localStorage.getItem('testSettings') || '{}').fontSize).toBe(18);

    await user.click(screen.getByText('Hide Timer'));
    expect(screen.getByTestId('showTimer')).toHaveTextContent('false');
    expect(JSON.parse(localStorage.getItem('testSettings') || '{}').showTimer).toBe(false);
  });

  test('loads settings from localStorage on mount', () => {
    localStorage.setItem('testSettings', JSON.stringify({ fontSize: 20, showTimer: false }));
    render(
      <TestSettingsProvider>
        <TestComponent />
      </TestSettingsProvider>
    );

    expect(screen.getByTestId('fontSize')).toHaveTextContent('20');
    expect(screen.getByTestId('showTimer')).toHaveTextContent('false');
  });
});
