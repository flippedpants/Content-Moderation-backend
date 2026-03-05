

const register = async(req,res) => {
    const {email, password} = req.body;

    const userExists = User.findOne({email});
    if(userExists){
        return res.status(400).json({message: "User already exists!"});
    }

    const hashedPassword = await hashPassword(password);


}