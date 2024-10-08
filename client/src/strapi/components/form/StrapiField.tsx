/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react'
import { useField, useFormikContext } from 'formik';
import { apiFetch } from '../../utils/service';
import { useStrapiContext } from '../../providers/StrapiAdmin';
import { Badge, Box, Card, Center, HStack, IconButton, Input, InputGroup, InputRightElement, List, ListItem, Spinner, Text, } from '@chakra-ui/react';
import { ChevronDownIcon, SmallCloseIcon } from '@chakra-ui/icons'


const StrapiField = ({ ...props }: any) => {
    const [field, meta] = useField(props.name)
    const { setFieldValue } = useFormikContext<any>();
    const { baseURL } = useStrapiContext()
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>("");
    const [values, setValues] = useState<any[]>([]);
    const [isLoading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setFieldValue(props.name, props?.multiple ? [] : {});
    }, [])
    useEffect(() => {
        if (meta.value) {
            if (!props.multiple) {
                setSearchValue(meta?.value?.label)
            }
            setFieldValue(props.name, meta?.value);
        }
    }, [props.name, meta.value, props.multiple])

    const handleGetDocument = async () => {
        
        const url = `${props.rules.model}?_q=${searchValue}`;
        const data = await apiFetch(baseURL + `/${url}`);
        if (props?.rules?.model === "users-permissions/roles") {
            const options = data?.roles?.map((item: any) => ({
                label: item[props.rules.field],
                value: item[props.rules.field],
                type: "connect",
                id: item?.id
            })) || [];
            setValues(options);
        } else {

            const options = data?.data?.map((item: any) => ({
                label: item.attributes[props.rules.field],
                value: item.attributes[props.rules.field],
                type: "connect",
                id: item?.id
            })) || [];
            setValues(options);
        }
        setLoading(false)
    }

    useEffect(() => {
        setLoading(true)
        const delay = setTimeout(async () => {
            await handleGetDocument()
            
        }, 300)

        return () => clearTimeout(delay)

    }, [searchValue]);

    useEffect(() => {
        handleGetDocument()
    }, [showMenu])

    const inputRef = useRef<any>(null);

    const handleInputClick = () => {
        setShowMenu(prev => !prev);
    };

    useEffect(() => {
        const handler = (e: any) => {
            if (inputRef.current && !inputRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        window.addEventListener("click", handler);
        return () => {
            window.removeEventListener("click", handler);
        };
    }, []);

    const isSelected = (option: any) => {
        if (!meta.value) return false;
        return props?.multiple
            ? meta.value.some((val: any) => (val.value === option.value && val.type !== "disconnect"))
            : meta.value.value === option.value;
    };

    const onItemClick = (option: any) => {
        let newValue;
        if (props?.multiple) {
            if (meta.value.some((val: any) => val.id === option.id)) {
                setShowMenu(false)
                return; // Do nothing if the option is already selected
            } else {
                newValue = [...meta.value, option];
            }
        } else {
            newValue = option;
        }
        setFieldValue(props.name, newValue);
        setSearchValue(props?.multiple ? "" : option.label);
        setShowMenu(false);
    };

    const onTagRemove = (e: any, option: any) => {
        e.stopPropagation();
        setFieldValue(props.name, meta.value.map((val: any) => {
            if (val.id === option.id) {
                return {
                    ...val,
                    type: "disconnect"
                }
            }
            else return val
        }));
    };

    const handleSave = async () => {
        const payload = { [props.rules.field]: searchValue }
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: payload }),
            credentials: 'include',
        };
        const { data } = await apiFetch(baseURL + `/${props.rules.model}`, options)
        const sortData = {
            label: data?.attributes[props.rules.field],
            value: data?.attributes[props.rules.field],
            type: "connect",
            id: data?.id
        };

        if (props?.multiple) {
            setFieldValue(props.name, [...meta?.value, sortData]);
            setSearchValue("")
        } else {
            setFieldValue(props.name, sortData);
        }

        setShowMenu(s => !s)
       
        // await createDocumentOption({
        //     data: { [props.rules.field]: searchValue },
        //     model: props.rules.model
        // });
    };


    const handleOnChange = (event: any) => {
        const { value } = event.target;
        // setFieldValue(props.name, value);
        setSearchValue(value)
        setShowMenu(true)
    }

    // console.log("meta", meta)
    return (
        <Box ref={inputRef} position='relative'  >
            <InputGroup onClick={handleInputClick}>
                <Input
                    size="md"
                    {...field}
                    type="text"
                    onChange={handleOnChange}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && isLoading === false) {
                            if (values.length > 0) {
                                onItemClick(values[0])
                            }
                            else{
                                handleSave()
                            }
                        }
                    }}
                    value={searchValue}
                />
                <InputRightElement>
                    <ChevronDownIcon color='gray.500' />
                </InputRightElement>

            </InputGroup>
            {
                showMenu &&
                <Card mt={2}>
                    {isLoading ? <Center py={4} >
                        <Spinner/>
                    </Center> : 
                    <List maxH="20rem" position="absolute" w='full' overflowX="auto" shadow="md" bg="white" transform={"scale(1)"} rounded="8px" zIndex={999999}>
                        <>
                            {values?.map((item: any, index: any) => (
                                <ListItem px={{ base: "3" }} alignItems={"center"} display={"flex"} py={{ base: "2" }} _hover={{ bg: "gray.100" }} bg={isSelected(item) && "gray.200"} key={index + 1} onClick={() => onItemClick(item)}><Text fontSize={"sm"} color="gray.500" mr="4" fontWeight={"700"}>{item.id}</Text>{item.label}</ListItem>

                            ))}
                            {(searchValue && (values.filter((value:any) => value.label === searchValue).length === 0)) && <ListItem px={{ base: "3" }} alignItems={"center"} display={"flex"} py={{ base: "2" }} _hover={{ bg: "gray.100" }} onClick={handleSave}  >
                                <Text fontSize={"sm"} color="gray.500" mr="4" fontWeight={"700"}>{">"}</Text><Text>Add <b>{searchValue}</b></Text>
                            </ListItem>}
                        </>
                    </List>}
                </Card>
            }


            {
                props?.multiple && (
                    <HStack wrap="wrap" gap="2" mt='2'>

                        {
                            meta && meta?.value && meta?.value?.map((tag: any, index: any) => tag.type !== "disconnect" && (
                                <Badge key={index} display="flex" gap="1" alignItems="center" >
                                    {tag.label}
                                    <IconButton aria-label='' bg="transparent" _hover={{ bg: "transparent" }} size="xs" onClick={(e) => onTagRemove(e, tag)} type="button" icon={<SmallCloseIcon />} />
                                </Badge>
                            ))
                        }
                    </HStack>
                )
            }

        </Box >

    )
}

export default React.memo(StrapiField)
