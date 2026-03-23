const Joi = require('joi');

const authSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().messages({
        'string.empty': 'Vui lòng nhập tên đăng nhập!',
        'string.min': 'Tên đăng nhập phải có ít nhất 3 ký tự!',
        'string.alphanum': 'Tên đăng nhập chỉ được chứa chữ và số!'
    }),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'Vui lòng nhập mật khẩu!',
        'string.min': 'Mật khẩu phải có ít nhất 6 ký tự!'
    })
});

const quickAddSchema = Joi.object({
    rawInput: Joi.string().min(2).max(100).required().messages({
        'string.empty': 'Vui lòng nhập nội dung hóa đơn!',
        'string.max': 'Nội dung tối đa 100 ký tự!'
    })
});

const checkImpactSchema = Joi.object({
    expenseAmount: Joi.number().positive().required().messages({
        'number.base': 'Số tiền phải là một con số!',
        'number.positive': 'Số tiền phải lớn hơn 0!'
    })
});

module.exports = { authSchema, quickAddSchema, checkImpactSchema };
