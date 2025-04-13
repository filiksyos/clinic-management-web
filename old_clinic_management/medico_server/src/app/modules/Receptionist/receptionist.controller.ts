import { RequestHandler} from 'express';
import { ReceptionistService } from './receptionist.service';
import pick from '../../../shared/pick';
import { receptionistFilterableFields } from './receptionist.constant';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';

const getAllFromDB: RequestHandler = catchAsync(
  async (req, res) => {
    const filters = pick(req.query, receptionistFilterableFields);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

    const result = await ReceptionistService.getAllReceptionists(filters, options);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Receptionist data fetched!',
      meta: result.meta,
      data: result.data,
    });
  },
);

const getByIdFromDB: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await ReceptionistService.getReceptionistById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Receptionist data fetched by id!',
    data: result,
  });
});

const createReceptionist: RequestHandler = catchAsync(async (req, res) => {
  const { adminId, ...data } = req.body;
  const result = await ReceptionistService.createReceptionist(adminId, data);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Receptionist created successfully!',
    data: result,
  });
});

const updateIntoDB: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await ReceptionistService.updateReceptionist(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Receptionist data updated!',
    data: result,
  });
});

const deleteFromDB: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await ReceptionistService.deleteReceptionist(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Receptionist data deleted!',
    data: result,
  });
});

export const ReceptionistController = {
  getAllFromDB,
  getByIdFromDB,
  createReceptionist,
  updateIntoDB,
  deleteFromDB,
};
