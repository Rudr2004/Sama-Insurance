import { Card, CardHeader, CardBody } from './Card.jsx';
import { Badge } from './Badge.jsx';
import { getOptionLabel, getModelsForMake } from '../../config/parameters.js';

function modelLabel(makeValue, modelValue) {
  if (!makeValue || !modelValue) return null;
  const model = getModelsForMake(makeValue).find((m) => m.value === modelValue);
  return model ? model.label : modelValue;
}

function Fact({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

// A motor policy runs exactly 1 year from its issue date (matches the real
// issued-policy records in seedPolicies: periodFrom = issueDate, periodTo =
// issueDate + 1yr - 1 day).
function derivePolicyPeriod(policyIssueDate) {
  if (!policyIssueDate) return null;
  const start = new Date(policyIssueDate);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  end.setDate(end.getDate() - 1);
  return { start, end };
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function describeExpiry(end) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round((endDay.getTime() - today.getTime()) / MS_PER_DAY);

  if (diffDays < 0) {
    const agoDays = Math.abs(diffDays);
    if (agoDays >= 60) {
      const months = Math.floor(agoDays / 30);
      return { text: `Expired ${months} month${months === 1 ? '' : 's'} ago`, tone: 'red' };
    }
    return { text: `Expired ${agoDays} day${agoDays === 1 ? '' : 's'} ago`, tone: 'red' };
  }
  if (diffDays === 0) return { text: 'Expires today', tone: 'amber' };
  if (diffDays <= 30) return { text: `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'}`, tone: 'amber' };
  return { text: `Expires ${end.toISOString().slice(0, 10)}`, tone: 'green' };
}

export function PolicyInputSummary({ input }) {
  const addonBadges = [
    input.zeroDepCover === 'yes' && 'Zero Dep Cover',
    input.paOwnerCover === 'yes' && 'PA Owner Cover',
    input.isCngLpg === 'yes' && 'CNG/LPG Fitted',
  ].filter(Boolean);

  const period = derivePolicyPeriod(input.policyIssueDate);
  const expiry = period ? describeExpiry(period.end) : null;

  return (
    <Card>
      <CardHeader title="Your Vehicle & Policy" subtitle="Quote generated for the following details." />
      <CardBody>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Fact label="Motor company" value={getOptionLabel('vehicleMake', input.vehicleMake)} />
          <Fact label="Model" value={modelLabel(input.vehicleMake, input.vehicleModel)} />
          <Fact label="Vehicle class" value={getOptionLabel('vehicleClass', input.vehicleClass)} />
          <Fact label="Subclass" value={getOptionLabel('vehicleSubclass', input.vehicleSubclass)} />
          <Fact label="Registration no." value={input.regNumber} />
          <Fact label="RTO" value={getOptionLabel('rto', input.rto)} />
          <Fact label="Fuel type" value={getOptionLabel('fuelType', input.fuelType)} />
          <Fact label="Cubic capacity" value={input.cubicCapacity ? `${input.cubicCapacity} cc` : null} />
          <Fact label="Seating capacity" value={input.seatingCapacity ? `${input.seatingCapacity}` : null} />
          <Fact label="Registration date" value={input.hasRegistrationDate === false ? 'Not registered yet' : input.registrationDate} />
          <Fact label="Vehicle age" value={input.hasRegistrationDate !== false && input.vehicleAge !== '' ? `${input.vehicleAge} yrs` : null} />
          <Fact label="Policy issue date" value={input.policyIssueDate} />
          <Fact label="Policy start date" value={period ? period.start.toISOString().slice(0, 10) : null} />
          <div>
            {period && (
              <>
                <p className="text-xs text-slate-400">Policy end date</p>
                <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5 flex-wrap">
                  {period.end.toISOString().slice(0, 10)}
                  <Badge tone={expiry.tone}>{expiry.text}</Badge>
                </p>
              </>
            )}
          </div>
          <Fact label="Policy type" value={getOptionLabel('policyType', input.policyType)} />
          <Fact label="Case type" value={getOptionLabel('caseType', input.caseType)} />
          <Fact label="NCB slab" value={input.ncb ? `${input.ncb}%` : null} />
          <Fact label="IDV" value={input.idv ? `₹${Number(input.idv).toLocaleString('en-IN')}` : null} />
          <Fact label="Premium amount" value={input.premiumAmount ? `₹${Number(input.premiumAmount).toLocaleString('en-IN')}` : null} />
        </div>

        {addonBadges.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-1.5">Addons selected</p>
            <div className="flex flex-wrap gap-1.5">
              {addonBadges.map((label) => (
                <Badge key={label} tone="violet">
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
