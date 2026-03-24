const Joi = require('joi');

const authSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().messages({
        'string.empty': 'Vui lòng nhập tên đăng nhập!',
        'string.min': 'Tên đăng nhập phải có ít nhất 3 ký tự!',
        'string.alphanum': 'Tên đăng nhập chỉ được chứa chữ và số!'
    }),
    password: Joi.string().min(8).max(128)
        .pattern(/^(?=.*[a-zA-Z])(?=.*\d)/)
        .required()
        .messages({
            'string.empty': 'Vui lòng nhập mật khẩu!',
            'string.min': 'Mật khẩu phải có ít nhất 8 ký tự!',
            'string.max': 'Mật khẩu tối đa 128 ký tự!',
            'string.pattern.base': 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số!'
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
