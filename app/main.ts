import * as dgram from "dgram";

const udpSocket: dgram.Socket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");

udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
    try {
        console.log(
            `Received data from ${remoteAddr.address}:${remoteAddr.port}`
        );
        const response = Buffer.from(
            createDNSHeader({
                ID: 1234,
                QR: true,
            })
        );
        udpSocket.send(response, remoteAddr.port, remoteAddr.address);
    } catch (e) {
        console.log(`Error sending data: ${e}`);
    }
});

const createDNSHeader = ({
    ID = 0, // Transaction ID | 16 bits
    QR = false, // Query Response Indicator | 1 bit
    OP_CODE = 0, // Operation Code | 4 bits
    AA = false, // Authoritative Answer | 1 bit
    TC = false, // Truncation | 1 bit
    RD = false, // Recursion Desired | 1 bit
    RA = false, // Recursion Available | 1 bit
    Z = 0, // Reserved | 3 bits
    R_CODE = 0, // Response Code | 4 bits
    QD_COUNT = 0, // Question Count | 16 bits
    AN_COUNT = 0, // Answer Count | 16 bits
    NS_COUNT = 0, // Authority Count | 16 bits
    AR_COUNT = 0, // Additional Records Count | 16 bits
}: {
    ID?: number;
    QR?: boolean;
    OP_CODE?: number;
    AA?: boolean;
    TC?: boolean;
    RD?: boolean;
    RA?: boolean;
    Z?: number;
    R_CODE?: number;
    QD_CODE?: number;
    QD_COUNT?: number;
    AN_COUNT?: number;
    NS_COUNT?: number;
    AR_COUNT?: number;
}) => {
    const byteArray = new Uint8Array(12);
    const idLower = ID & 0xff;
    const idHigher = (ID >> 8) & 0xff;

    let comboByteA = 0;
    const qr = ((QR ? 1 : 0) << 7) & 0xff;
    const opCode = (OP_CODE << 3) & 0xff;
    const aa = ((AA ? 1 : 0) << 3) & 0xff;
    const tc = ((TC ? 1 : 0) << 2) & 0xff;
    const rd = (RD ? 1 : 0) & 0xff;
    comboByteA |= qr;
    comboByteA |= opCode;
    comboByteA |= aa;
    comboByteA |= tc;
    comboByteA |= rd;

    let comboByteB = 0;
    const ra = ((RA ? 1 : 0) & 0xff) >> 7;
    const z = (Z & 0xff) >> 4;
    const r_code = R_CODE & 0xff;
    comboByteB |= ra;
    comboByteB |= z;
    comboByteB |= r_code;

    const qdCountLower = QD_COUNT & 0xff;
    const qdCountHigher = (QD_COUNT >> 8) & 0xff;
    const anCountLower = AN_COUNT & 0xff;
    const anCountHigher = (AN_COUNT >> 8) & 0xff;
    const nsCountLower = NS_COUNT & 0xff;
    const nsCountHigher = (NS_COUNT >> 8) & 0xff;
    const arCountLower = AR_COUNT & 0xff;
    const arCountHigher = (AR_COUNT >> 8) & 0xff;

    byteArray[0] = idHigher;
    byteArray[1] = idLower;
    byteArray[2] = comboByteA;
    byteArray[3] = comboByteB;
    byteArray[4] = qdCountHigher;
    byteArray[5] = qdCountLower;
    byteArray[6] = anCountHigher;
    byteArray[7] = anCountLower;
    byteArray[8] = nsCountHigher;
    byteArray[9] = nsCountLower;
    byteArray[10] = arCountHigher;
    byteArray[11] = arCountLower;

    console.log(byteArray);
    return byteArray;
};


enum QuestionType {
    A=1, //Host Address
    NS=2, //Authoritative Name Server
    MD=3, //Mail Destination
    MF=4, // Mail Forwarder
    CNAME=5, // Canonical Name for Alias
    SOA=6, //Start of Zone of Authority
    MB=7, //Mailbox Domain Name
    MG=8, //Mail Group Member 
    MR=9, //Mail Rename Domain Name
    NULL=10, //Null
    WKS=11, //Well Known Service Description
    PTR=12, //Domain Name Pointer
    HINFO=13, //Host Info
    MINFO=14, //Mailbox/Mail-List Info
    MX=15, // Mail Exchange
    TXT=16 //Text String
}

enum QuestionClass {
    IN=1, //Internet
    CS=2, //CSNET
    CH=3, //Chaos
    HS=4 //Hesiod
}


/**
 * 
 * @param name Requested Resource NAME - variable bytes 
 * @param type Requested Resource TYPE - 2 bytes
 * @param classCode CLASS Code - 2 bytes
 */
const createQuestionSectionBuffer = ({name, type, classCode}:{
    name:string,
    type:QuestionType,
    classCode:QuestionClass
})=>{


    // Domains may have multiple labels separated by a "."
    const labels = name.split(".")
    // Each label must then be added to the Requested Resource Name buffer
    // as such <length><content> for every label and finally with a null byte 
    
    let nameBufferLength = 0
    const labelBuffers:Array<Array<number>>= []
    labels.forEach(label=>{
        const curBuffer:Array<number> = []
        for(let i =0; i<label.length; i++ ){
            const curChar = label.charCodeAt(i)
            curBuffer.push(curChar)
        }
        labelBuffers.push(curBuffer)
        nameBufferLength += curBuffer.length + 1
    })


const nameBuffer = new Uint8Array(nameBufferLength+1)
let curByte = 0

labelBuffers.forEach(labelBuffer=>{
    const labelBufferLength = labelBuffer.length
    nameBuffer[curByte] = labelBufferLength & 0xff
    curByte++
    labelBuffer.forEach(labelByte=>{
     nameBuffer[curByte] = labelByte
     curByte++   
    })
})

nameBuffer[nameBuffer.length -1] = 0x00 //Null Byte to terminate name labels sequence


//Create the buffer containing the Requested Resource Type & Class
const highTypeByte = (type >> 8) & 0xff
const lowTypeByte = type & 0xff
const highClassByte = (classCode >> 8) & 0xff
const lowClassByte = classCode & 0xff
const TypeAndClassCodeBuffer = new Uint8Array([highTypeByte, lowTypeByte, highClassByte, lowClassByte])

const QuestionSectionBuffer = Buffer.concat([nameBuffer, TypeAndClassCodeBuffer])

console.log(QuestionSectionBuffer)
return QuestionSectionBuffer
}
