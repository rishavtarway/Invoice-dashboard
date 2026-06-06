import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { STATUS_COLORS } from '../../utils/statusColors';

export default function StatusDonut({ breakdown }) {
  const data = [
    { name: 'Paid', value: breakdown.Paid || 0, color: STATUS_COLORS.Paid },
    { name: 'Unpaid', value: breakdown.Unpaid || 0, color: STATUS_COLORS.Unpaid },
    { name: 'Overdue', value: breakdown.Overdue || 0, color: STATUS_COLORS.Overdue },
    {
      name: 'Other',
      value: (breakdown.Draft || 0) + (breakdown.Sent || 0) + (breakdown.Void || 0),
      color: '#9B9690',
    },
  ].filter((d) => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="h-[180px] w-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} (${Math.round((value / total) * 100)}%)`, name]}
              contentStyle={{
                fontSize: 12,
                borderRadius: 6,
                border: '1px solid #E5E3DF',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1.5 text-xs text-inkSecondary">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-ink">
              {d.name} · {d.value}
            </span>
            <span className="text-muted">({Math.round((d.value / total) * 100)}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
