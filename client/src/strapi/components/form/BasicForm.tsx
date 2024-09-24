/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Form, Formik } from 'formik'
import React, { useEffect } from 'react'
import { useStrapiFormContext } from '../../providers/StrapiFormProvider';
import FormFields from './FormFields';
import { Box, Grid, Heading, HStack } from '@chakra-ui/react';
import * as Yup from "yup"

interface BasicFromProps {
    fieldsSchema: any;
    name?: string,
    type?: string,
}
const BasicForm: React.FC<BasicFromProps> = ({ fieldsSchema, name = "", type = "Basic" }) => {

    const { setSchema, data, handleData } = useStrapiFormContext();

    const formValue = Object.hasOwn(data, name) ? data[name] : {}

    useEffect(() => {
        setSchema({ type, schema: fieldsSchema, name })
    }, [fieldsSchema, name])

    const initialValues: { [key: string]: any } = {};
    const validationSchemaFields: { [key: string]: any } = {};

    fieldsSchema.forEach((field: any) => {
        if (field?.multiple) {
            initialValues[`${field.name}`] = formValue[`${field.name}`] ? formValue[`${field.name}`] : [];
        }
        else {
            initialValues[`${field.name}`] = formValue[`${field.name}`] ? formValue[`${field.name}`] : '';
        }
        if (field?.required) {
            validationSchemaFields[`${field.name}`] = Yup.string().required(`${field.label || field.name} is required`);
        }
    });

    const validationSchema = Yup.object().shape(validationSchemaFields);

    return (
        <Box>
          {type === "Component" && <HStack pb="6" justify="space-between" alignItems="center">
                <Heading fontSize="sm" textTransform="capitalize" >{name}</Heading>
            </HStack>}
            <Formik
                initialValues={initialValues}
                enableReinitialize
                onSubmit={() => { }}
                validate={(values: any) => { handleData(name, values) }}
                validationSchema={validationSchema}
            >
                <Form>
                    <Grid templateColumns="repeat(12, 1fr)" templateRows="repeat(1,1fr)" gap="4" >
                        {fieldsSchema.map((field: any, index: any) => (
                            <FormFields key={index} {...field} />
                        ))}
                    </Grid>
                </Form>

            </Formik >
        </Box>
    )
}

export default BasicForm
