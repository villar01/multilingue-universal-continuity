#!/bin/bash
curl -X POST https://3000-iy8qmn2801pw4b2no9bu5-1873dc84.us2.manus.computer/api/trpc/lessons.generateMassive \
  -H "Content-Type: application/json" \
  -d '{"count":50,"level":"mixed","ageLevel":"mixed","specialization":"mixed"}'
