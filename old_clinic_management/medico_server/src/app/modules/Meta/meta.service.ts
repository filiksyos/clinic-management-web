import { PaymentStatus, Prisma, UserRole } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { IAuthUser } from '../../../interfaces/common';

const fetchDashboardMetaData = async (user: IAuthUser) => {
  let metaData;

  switch (user?.role) {
    case UserRole.ADMIN:
      metaData = getAdminMetaData();
      break;
    case UserRole.RECEPTIONIST:
      metaData = getReceptionistMetaData();
      break;
    case UserRole.DOCTOR:
      metaData = getDoctorMetaData(user);
      break;
    case UserRole.PATIENT:
      metaData = getPatientMetaData(user);
      break;
    default:
      throw new Error('Invalid user role!');
  }

  return metaData;
};

const getReceptionistMetaData = async () => {
  const appointmentCount = await prisma.appointment.count();
  const patientCount = await prisma.patient.count();
  const doctorCount = await prisma.doctor.count();
  const adminCount = await prisma.admin.count();
  const paymentCount = await prisma.payment.count();

  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: PaymentStatus.PAID,
    },
  });

  const barChartData = await getBarChartData();
  const pieCharData = await getPieChartData();

  return {
    appointmentCount,
    patientCount,
    doctorCount,
    adminCount,
    paymentCount,
    totalRevenue,
    barChartData,
    pieCharData,
  };
};

const getAdminMetaData = async () => {
  try {
    // Use safe counting with fallbacks in case of errors
    let appointmentCount = 0;
    let patientCount = 0;
    let doctorCount = 0;
    let paymentCount = 0;
    let totalRevenue = { _sum: { amount: 0 } };
    let todayAppointments = 0;
    let tomorrowAppointments = 0;
    let upcomingAppointments = 0;

    try {
      patientCount = await prisma.patient.count();
    } catch (error) {
      console.error("Error counting patients:", error);
    }

    try {
      doctorCount = await prisma.doctor.count();
    } catch (error) {
      console.error("Error counting doctors:", error);
    }

    try {
      appointmentCount = await prisma.appointment.count();
    } catch (error) {
      console.error("Error counting appointments:", error);
    }

    try {
      paymentCount = await prisma.payment.count();
    } catch (error) {
      console.error("Error counting payments:", error);
    }

    try {
      const result = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: "PAID", // Using string directly instead of enum
        },
      });
      if (result._sum.amount !== null) {
        totalRevenue = result;
      }
    } catch (error) {
      console.error("Error calculating total revenue:", error);
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get tomorrow's date
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    try {
      // Get appointments for today
      todayAppointments = await prisma.appointment.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      });
    } catch (error) {
      console.error("Error counting today's appointments:", error);
    }

    try {
      // Get appointments for tomorrow
      tomorrowAppointments = await prisma.appointment.count({
        where: {
          createdAt: {
            gte: tomorrow,
            lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });
    } catch (error) {
      console.error("Error counting tomorrow's appointments:", error);
    }

    try {
      // Get upcoming appointments (from tomorrow onward)
      upcomingAppointments = await prisma.appointment.count({
        where: {
          createdAt: {
            gte: tomorrow,
          },
        },
      });
    } catch (error) {
      console.error("Error counting upcoming appointments:", error);
    }

    // Use empty data for charts if they fail
    let barChartData = [];
    let pieCharData = [];
    
    try {
      barChartData = await getBarChartData();
    } catch (error) {
      console.error("Error getting bar chart data:", error);
    }
    
    try {
      pieCharData = await getPieChartData();
    } catch (error) {
      console.error("Error getting pie chart data:", error);
    }

    return {
      appointmentCount,
      patientCount,
      doctorCount,
      paymentCount,
      totalRevenue,
      todayAppointments,
      tomorrowAppointments,
      upcomingAppointments,
      barChartData,
      pieCharData,
    };
  } catch (error) {
    console.error("Error in getAdminMetaData:", error);
    // Return default values if something goes wrong
    return {
      appointmentCount: 0,
      patientCount: 0,
      doctorCount: 0,
      paymentCount: 0,
      totalRevenue: { _sum: { amount: 0 } },
      todayAppointments: 0,
      tomorrowAppointments: 0,
      upcomingAppointments: 0,
      barChartData: [],
      pieCharData: [],
    };
  }
};

const getDoctorMetaData = async (user: IAuthUser) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const appointmentCount = await prisma.appointment.count({
    where: {
      doctorId: doctorData.id,
    },
  });

  const patientCount = await prisma.appointment.groupBy({
    by: ['patientId'],
    _count: {
      id: true,
    },
  });

  const reviewCount = await prisma.review.count({
    where: {
      doctorId: doctorData.id,
    },
  });

  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      appointment: {
        doctorId: doctorData.id,
      },
      status: PaymentStatus.PAID,
    },
  });
  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get tomorrow's date
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Get appointments for today
  const todayAppointments = await prisma.appointment.count({
    where: {
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  // Get appointments for tomorrow
  const tomorrowAppointments = await prisma.appointment.count({
    where: {
      createdAt: {
        gte: tomorrow,
        lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  // Get upcoming appointments (from tomorrow onward)
  const upcomingAppointments = await prisma.appointment.count({
    where: {
      createdAt: {
        gte: tomorrow,
      },
    },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ['status'],
    _count: { id: true },
    where: {
      doctorId: doctorData.id,
    },
  });

  const formattedAppointmentStatusDistribution =
    appointmentStatusDistribution.map(({ status, _count }) => ({
      status,
      count: Number(_count.id),
    }));

  return {
    appointmentCount,
    reviewCount,
    patientCount: patientCount.length,
    totalRevenue,
    todayAppointments,
    tomorrowAppointments,
    upcomingAppointments,
    formattedAppointmentStatusDistribution,
  };
};

const getPatientMetaData = async (user: IAuthUser) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const appointmentCount = await prisma.appointment.count({
    where: {
      patientId: patientData.id,
    },
  });

  const prescriptionCount = await prisma.prescription.count({
    where: {
      patientId: patientData.id,
    },
  });

  const reviewCount = await prisma.review.count({
    where: {
      patientId: patientData.id,
    },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ['status'],
    _count: { id: true },
    where: {
      patientId: patientData.id,
    },
  });

  const formattedAppointmentStatusDistribution =
    appointmentStatusDistribution.map(({ status, _count }) => ({
      status,
      count: Number(_count.id),
    }));

  return {
    appointmentCount,
    prescriptionCount,
    reviewCount,
    formattedAppointmentStatusDistribution,
  };
};

const getBarChartData = async () => {
  const appointmentCountByMonth: { month: Date; count: bigint }[] =
    await prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "createdAt") AS month,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM "appointments"
        GROUP BY month
        ORDER BY month ASC
    `;

  return appointmentCountByMonth;
};

const getPieChartData = async () => {
  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  const formattedAppointmentStatusDistribution =
    appointmentStatusDistribution.map(({ status, _count }) => ({
      status,
      count: Number(_count.id),
    }));

  return formattedAppointmentStatusDistribution;
};

export const MetaService = {
  fetchDashboardMetaData,
};
