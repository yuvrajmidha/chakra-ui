import React from 'react'
import AuthLayout from './AuthLayout'
import { Stack } from '@chakra-ui/react'
import LoginComponent from '../strapi/components/auth/LoginComponent'

const Login = () => {
    return (
        <AuthLayout heading='Log in to your account' url="login" >
            <Stack spacing="5">
               <LoginComponent/>
            </Stack>
        </AuthLayout>
    )
}

export default Login
