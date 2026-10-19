import { db } from "../../config/database.ts";
import env from "../../config/env.ts";
import {
  program as programTable,
  tool as toolTable,
  toolUnit as toolUnitTable,
  user as userTable,
  workArea as workAreaTable,
  workCenter as workCenterTable,
} from "../schema/index.ts";

async function seed() {
  const [wc1, wc2] = await db
    .insert(workCenterTable)
    .values([
      { name: "Sheet Metal Assembly", code: "S04J", orgCode: "SMA-01" },
      { name: "Final Aircraft Assembly", code: "S05A", orgCode: "FAA-02" },
    ])
    .onConflictDoNothing()
    .returning();

  const workCenterId = wc1 ? wc1.id : 1;

  const [wa1] = await db
    .insert(workAreaTable)
    .values([
      { name: "Hangar 1 - Station 3", description: "Fuselage Join Area" },
      { name: "Wing Shop Line 2", description: "Wingbox Structure Area" },
    ])
    .returning();

  const workAreaId = wa1 ? wa1.id : 1;

  const [prog1, prog2] = await db
    .insert(programTable)
    .values([
      { name: "N219 Nurtanio", category: "FIXED WING" },
      { name: "NC212i Aviocar", category: "FIXED WING" },
      { name: "CN235 Maritime", category: "FIXED WING" },
      { name: "BELL 412EP", category: "ROTARY WING" },
    ])
    .onConflictDoNothing()
    .returning();

  const programId = prog1 ? prog1.id : 1;

  const defaultHash = env.SUPER_ADMIN_PASS;
  await db
    .insert(userTable)
    .values([
      {
        workCenterId,
        workAreaId,
        employeeId: 10001,
        name: "Super Administrator",
        email: "superadmin@ptdi.co.id",
        passwordHash: defaultHash,
        role: "SUPER ADMIN",
        department: "System Operations",
        status: "ACTIVE",
      },
      {
        workCenterId,
        workAreaId,
        employeeId: 10002,
        name: "Tool Crib (Admin)",
        email: "admin@ptdi.co.id",
        passwordHash: defaultHash,
        role: "ADMIN",
        department: "Tool Crib Warehouse",
        status: "ACTIVE",
      },
      {
        workCenterId,
        workAreaId,
        employeeId: 10003,
        name: "QC Inspector",
        email: "qc@ptdi.co.id",
        passwordHash: defaultHash,
        role: "QUALITY CONTROL",
        department: "Quality Assurance",
        status: "ACTIVE",
      },
      {
        workCenterId,
        workAreaId,
        employeeId: 10004,
        name: "Technician",
        email: "user@ptdi.co.id",
        passwordHash: defaultHash,
        role: "USER",
        department: "Manufacturing",
        status: "ACTIVE",
      },
    ])
    .onConflictDoNothing();

    const [tool1, tool2, tool3] = await db
    .insert(toolTable)
    .values([
      {
        toolNumber: "TL-TW-0100",
        name: "Digital Torque Wrench 20-100 Nm",
        programId,
        description: "Precision calibration wrench for airframe fasteners",
        qcPeriode: 6,
        location: "Rack A-01",
      },
      {
        toolNumber: "TL-RG-0340",
        name: "Pneumatic Rivet Gun 3X",
        programId,
        description: "Standard solid rivet installation gun",
        qcPeriode: 12,
        location: "Rack B-03",
      },
      {
        toolNumber: "TL-DB-0050",
        name: "Cobalt Drill Bit 5.0mm (Set of 10)",
        programId,
        description: "Hard metal drilling tool for titanium alloy",
        qcPeriode: 3,
        location: "Drawer C-12",
      },
    ])
    .onConflictDoNothing()
    .returning();

  if (tool1) {
    await db
      .insert(toolUnitTable)
      .values([
        { toolId: tool1.id, seqNo: "001", status: "READY" },
        { toolId: tool1.id, seqNo: "002", status: "READY" },
        { toolId: tool1.id, seqNo: "003", status: "READY" },
        { toolId: tool2 ? tool2.id : tool1.id, seqNo: "001", status: "READY" },
        { toolId: tool2 ? tool2.id : tool1.id, seqNo: "002", status: "READY" },
        { toolId: tool3 ? tool3.id : tool1.id, seqNo: "001", status: "READY" },
      ])
      .onConflictDoNothing();
  }

  console.log("Success Seeding DB");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding error: ", err);
  process.exit(1);
});

// This is merely an example; it does not constitute actual data, nor does it utilize confidential data from PTDI.