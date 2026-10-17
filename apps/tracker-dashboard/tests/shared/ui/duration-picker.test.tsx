import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  DurationPicker,
  type DurationUnit,
} from '@repo/ui-kit/components/common/form/duration-picker';

const LABELS = {
  years: 'Years',
  months: 'Months',
  days: 'Days',
  hours: 'Hours',
  minutes: 'Minutes',
  hint: '',
} as const;

function renderPicker(value: string, units: DurationUnit[]) {
  const onChange = vi.fn();
  render(
    <DurationPicker
      value={value}
      units={units}
      labels={LABELS}
      onChange={onChange}
    />,
  );
  return onChange;
}

describe('DurationPicker', () => {
  it('focuses the clicked segment instead of the first one', async () => {
    const user = userEvent.setup();
    renderPicker('P1Y2M3D', ['years', 'months', 'days']);

    await user.click(screen.getByRole('spinbutton', { name: 'Months' }));

    expect(screen.getByRole('spinbutton', { name: 'Months' })).toHaveFocus();
    expect(screen.getByRole('spinbutton', { name: 'Years' })).not.toHaveFocus();
  });

  it('replaces the selected digits when typing and commits on blur', async () => {
    const user = userEvent.setup();
    const onChange = renderPicker('PT5M', ['hours', 'minutes']);
    const minutes = screen.getByRole('spinbutton', { name: 'Minutes' });

    await user.click(minutes);
    await user.keyboard('45');
    await user.click(screen.getByRole('spinbutton', { name: 'Hours' }));

    expect(onChange).toHaveBeenLastCalledWith('PT45M');
  });

  it('clears the cell with Backspace on the selection and commits zero on blur', async () => {
    const user = userEvent.setup();
    const onChange = renderPicker('PT5M', ['hours', 'minutes']);
    const minutes = screen.getByRole('spinbutton', { name: 'Minutes' });

    await user.click(minutes);
    await user.keyboard('{Backspace}');

    expect(minutes).toHaveValue('');

    await user.tab();

    expect(onChange).toHaveBeenLastCalledWith('PT0S');
  });

  it('moves focus between segments with arrow keys at the cell edges', async () => {
    const user = userEvent.setup();
    renderPicker('PT1H30M', ['hours', 'minutes']);
    const hours = screen.getByRole('spinbutton', { name: 'Hours' });
    const minutes = screen.getByRole('spinbutton', { name: 'Minutes' });

    await user.click(hours);
    await user.keyboard('{ArrowRight}');

    expect(minutes).toHaveFocus();

    await user.keyboard('{ArrowLeft}');

    expect(hours).toHaveFocus();
  });

  it('increments with ArrowUp and keeps the new value selected', async () => {
    const user = userEvent.setup();
    const onChange = renderPicker('PT5M', ['minutes']);
    const minutes = screen.getByRole('spinbutton', { name: 'Minutes' });

    await user.click(minutes);
    await user.keyboard('{ArrowUp}');

    expect(onChange).toHaveBeenLastCalledWith('PT6M');
    expect(minutes).toHaveFocus();
  });

  it('reverts an in-progress edit on Escape', async () => {
    const user = userEvent.setup();
    renderPicker('PT5M', ['minutes']);
    const minutes = screen.getByRole('spinbutton', { name: 'Minutes' });

    await user.click(minutes);
    await user.keyboard('9');

    expect(minutes).toHaveValue('9');

    await user.keyboard('{Escape}');

    expect(minutes).toHaveValue('05');
  });

  it('clamps an out-of-range draft on commit', async () => {
    const user = userEvent.setup();
    const onChange = renderPicker('PT0S', ['hours']);
    const hours = screen.getByRole('spinbutton', { name: 'Hours' });

    await user.click(hours);
    await user.keyboard('25');
    await user.tab();

    expect(onChange).toHaveBeenLastCalledWith('PT23H');
  });

  it('commits a multi-digit value typed in one keystroke sequence without dropping digits', async () => {
    const user = userEvent.setup();
    const onChange = renderPicker('PT0S', ['minutes']);

    await user.click(screen.getByRole('spinbutton', { name: 'Minutes' }));
    await user.keyboard('95');
    await user.tab();

    expect(onChange).toHaveBeenLastCalledWith('PT59M');
  });
});
