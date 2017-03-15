// Code generated by protoc-gen-go.
// source: UnProtos/Data/Vec3.proto
// DO NOT EDIT!

package UnProtos_Data

import proto "github.com/golang/protobuf/proto"
import fmt "fmt"
import math "math"

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// Vec3 определяет 3-мерный вектор
type Vec3 struct {
	X float64 `protobuf:"fixed64,1,opt,name=x" json:"x,omitempty"`
	Y float64 `protobuf:"fixed64,2,opt,name=y" json:"y,omitempty"`
	Z float64 `protobuf:"fixed64,3,opt,name=z" json:"z,omitempty"`
}

func (m *Vec3) Reset()                    { *m = Vec3{} }
func (m *Vec3) String() string            { return proto.CompactTextString(m) }
func (*Vec3) ProtoMessage()               {}
func (*Vec3) Descriptor() ([]byte, []int) { return fileDescriptor1, []int{0} }

func (m *Vec3) GetX() float64 {
	if m != nil {
		return m.X
	}
	return 0
}

func (m *Vec3) GetY() float64 {
	if m != nil {
		return m.Y
	}
	return 0
}

func (m *Vec3) GetZ() float64 {
	if m != nil {
		return m.Z
	}
	return 0
}

func init() {
	proto.RegisterType((*Vec3)(nil), "UnProtos.Data.Vec3")
}

func init() { proto.RegisterFile("UnProtos/Data/Vec3.proto", fileDescriptor1) }

var fileDescriptor1 = []byte{
	// 95 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0xe2, 0x92, 0x08, 0xcd, 0x0b, 0x28,
	0xca, 0x2f, 0xc9, 0x2f, 0xd6, 0x77, 0x49, 0x2c, 0x49, 0xd4, 0x0f, 0x4b, 0x4d, 0x36, 0xd6, 0x2b,
	0x00, 0x09, 0x08, 0xf1, 0xc2, 0x64, 0xf4, 0x40, 0x32, 0x4a, 0x06, 0x5c, 0x2c, 0x20, 0x49, 0x21,
	0x1e, 0x2e, 0xc6, 0x0a, 0x09, 0x46, 0x05, 0x46, 0x0d, 0xc6, 0x20, 0xc6, 0x0a, 0x10, 0xaf, 0x52,
	0x82, 0x09, 0xc2, 0xab, 0x04, 0xf1, 0xaa, 0x24, 0x98, 0x21, 0xbc, 0xaa, 0x24, 0x36, 0xb0, 0x39,
	0xc6, 0x80, 0x00, 0x00, 0x00, 0xff, 0xff, 0x02, 0x59, 0x36, 0x2b, 0x63, 0x00, 0x00, 0x00,
}
