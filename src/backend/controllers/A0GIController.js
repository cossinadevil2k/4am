import { CURD_CONTROLLER } from '@/utils/curd'
import AOGIService from '@/services/A0GIService'
import * as responseCodes from "@/constants/responseCodes"

class A0GI_CONTROLLER extends CURD_CONTROLLER {
    constructor(service) {
        super(service)
    }
    faucet = async (req, res) => {
        try {
            const { dbid } = req.query
            if (!dbid) {
                return res.status(responseCodes.BAD_REQUEST).json({ code: responseCodes.BAD_REQUEST, message: " dbid is required", data: null })
            }
            const data = await AOGIService.faucet(dbid)
            res.json({ code: responseCodes.SUCCESS, message: "success", data })
        } catch (error) {
            res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
        }
    }
    getBalance = async (req, res) => {
        try {
            const { dbid } = req.query
            if (!dbid) {
                return res.status(responseCodes.BAD_REQUEST).json({ code: responseCodes.BAD_REQUEST, message: " dbid is required", data: null })
            }
            const data = await AOGIService.getBalance(dbid)
            res.json({ code: responseCodes.SUCCESS, message: "success", data })
        } catch (error) {
            res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
        }
    }
}


export default new A0GI_CONTROLLER(AOGIService)